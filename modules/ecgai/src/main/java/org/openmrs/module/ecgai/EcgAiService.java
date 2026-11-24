package org.openmrs.module.ecgai;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.Method;
import java.nio.file.Files;
import java.time.Instant;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicReference;

import javax.annotation.PreDestroy;
import javax.imageio.ImageIO;

import com.fasterxml.jackson.databind.node.ObjectNode;
import org.openmrs.Concept;
import org.openmrs.Obs;
import org.openmrs.Order;
import org.openmrs.api.APIException;
import org.openmrs.api.context.Context;
import org.openmrs.api.context.Daemon;
import org.openmrs.obs.ComplexData;
import org.openmrs.obs.ComplexObsHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Runs AI reads as background jobs, one per order: start (returns at once), then poll the status. The ECG file is read
 * in the caller's request (with the caller's privileges); the model call runs on a worker thread; the result is saved
 * as an "ECG AI interpretation" observation on the order, in the order's encounter.
 */
@Component("ecgai.EcgAiService")
public class EcgAiService {

	private static final Logger log = LoggerFactory.getLogger(EcgAiService.class);

	public static final String RUNNING = "running";

	public static final String DONE = "done";

	public static final String FAILED = "failed";

	public static final String IDLE = "idle";

	public static final String NOT_CONFIGURED = "not_configured";

	private final ExecutorService executor = Executors.newFixedThreadPool(2, r -> {
		Thread t = new Thread(r, "ecgai-read");
		t.setDaemon(true);
		return t;
	});

	private final Map<String, Map<String, Object>> jobs = new ConcurrentHashMap<>();

	private final EcgReader reader = new EcgReader();

	/** A file the caller is allowed to read. */
	public static final class EcgFile {

		final byte[] data;

		final String mimeType;

		EcgFile(byte[] data, String mimeType) {
			this.data = data;
			this.mimeType = mimeType;
		}
	}

	public Map<String, Object> health() {
		EcgAiSettings s = EcgAiSettings.load();
		Map<String, Object> m = new LinkedHashMap<>();
		m.put("ok", true);
		m.put("provider", s.provider());
		m.put("model", s.model());
		m.put("configured", s.isConfigured());
		m.put("prompt", s.promptFileExists() ? s.promptFile()
		        : "bundled prompt.txt" + (s.promptFile() == null ? "" : " (" + s.promptFile() + " not found)"));
		return m;
	}

	public Map<String, Object> status(String orderUuid) {
		Map<String, Object> job = jobs.get(orderUuid);
		if (job != null) {
			return job;
		}
		EcgAiSettings s = EcgAiSettings.load();
		return state(s.isConfigured() ? IDLE : NOT_CONFIGURED, null);
	}

	/**
	 * Starts a read of the order's uploaded ECG. Must be called in the user's request: the order and the file are
	 * loaded with the user's privileges.
	 */
	public synchronized Map<String, Object> start(Order order, Obs attachment) {
		EcgAiSettings settings = EcgAiSettings.load();
		if (!settings.isConfigured()) {
			return state(NOT_CONFIGURED, "No API key for provider '" + settings.provider() + "'");
		}
		Map<String, Object> current = jobs.get(order.getUuid());
		if (current != null && RUNNING.equals(current.get("status"))) {
			return current;
		}
		EcgFile file = readFile(attachment);
		String orderUuid = order.getUuid();
		String attachmentUuid = attachment.getUuid();
		org.openmrs.User user = Context.getAuthenticatedUser();
		String requestedBy = user.getUsername() != null ? user.getUsername() : user.getSystemId();
		Map<String, Object> running = state(RUNNING, null);
		jobs.put(orderUuid, running);
		executor.submit(() -> run(settings, orderUuid, attachmentUuid, requestedBy, file));
		return running;
	}

	private void run(EcgAiSettings settings, String orderUuid, String attachmentUuid, String requestedBy, EcgFile file) {
		long started = System.currentTimeMillis();
		Map<String, Object> result;
		try {
			ObjectNode read = reader.read(settings, file.data, file.mimeType);
			read.put("provider", settings.provider());
			read.put("model", settings.model());
			read.put("attachmentUuid", attachmentUuid);
			read.put("requestedBy", requestedBy);
			read.put("generatedAt", Instant.now().toString());
			String obsUuid = save(settings, orderUuid, read.toString());
			result = state(DONE, null);
			result.put("obsUuid", obsUuid);
			log.info("ECG AI: order {} read in {} ms ({})", orderUuid, System.currentTimeMillis() - started,
			    read.get("disposition").asText());
		}
		catch (EcgReader.NotConfiguredException e) {
			result = state(NOT_CONFIGURED, e.getMessage());
			log.warn("ECG AI: order {}: {}", orderUuid, e.getMessage());
		}
		catch (RuntimeException e) {
			result = state(FAILED, e.getMessage());
			log.error("ECG AI: order {}: read failed", orderUuid, e);
		}
		jobs.put(orderUuid, result);
	}

	/** Saves the read as a text observation on the order, in its encounter (as the daemon user). */
	private String save(EcgAiSettings settings, String orderUuid, String json) {
		AtomicReference<String> saved = new AtomicReference<>();
		AtomicReference<RuntimeException> error = new AtomicReference<>();
		Daemon.runInDaemonThreadAndWait(() -> {
			try {
				Order order = Context.getOrderService().getOrderByUuid(orderUuid);
				Concept concept = Context.getConceptService().getConceptByUuid(settings.resultConceptUuid());
				if (concept == null) {
					throw new APIException("Concept " + settings.resultConceptUuid()
					        + " (ECG AI interpretation) is missing: run scripts/imaging-orders-o3-setup.sh");
				}
				Obs obs = new Obs(order.getPatient(), concept, new Date(),
				        order.getEncounter() == null ? null : order.getEncounter().getLocation());
				obs.setEncounter(order.getEncounter());
				obs.setOrder(order);
				obs.setValueText(json);
				saved.set(Context.getObsService().saveObs(obs, null).getUuid());
			}
			catch (RuntimeException e) {
				error.set(e);
			}
		}, EcgAiActivator.getDaemonToken());
		if (error.get() != null) {
			throw new IllegalStateException("Could not save the AI read: " + error.get().getMessage(), error.get());
		}
		if (saved.get() == null) {
			throw new IllegalStateException("Could not save the AI read");
		}
		return saved.get();
	}

	/** The attachment's bytes and type (PNG, JPEG, GIF, WebP or PDF), read with the caller's privileges. */
	EcgFile readFile(Obs attachment) {
		Obs complex = Context.getObsService().getComplexObs(attachment.getObsId(), ComplexObsHandler.RAW_VIEW);
		ComplexData cd = complex == null ? null : complex.getComplexData();
		if (cd == null) {
			throw new APIException("The ECG file has no content");
		}
		byte[] bytes = bytes(cd);
		String mime = sniff(bytes);
		if (mime == null) {
			throw new APIException("Unsupported ECG file type (use PNG, JPEG or PDF)");
		}
		return new EcgFile(bytes, mime);
	}

	private static byte[] bytes(ComplexData cd) {
		try {
			// the attachments module's complex data knows its own bytes
			Method m = cd.getClass().getMethod("asByteArray");
			Object b = m.invoke(cd);
			if (b instanceof byte[] && ((byte[]) b).length > 0) {
				return (byte[]) b;
			}
		}
		catch (ReflectiveOperationException e) {
			// plain ComplexData: fall through
		}
		Object data = cd.getData();
		try {
			if (data instanceof byte[]) {
				return (byte[]) data;
			}
			if (data instanceof InputStream) {
				try (InputStream in = (InputStream) data) {
					return in.readAllBytes();
				}
			}
			if (data instanceof File) {
				return Files.readAllBytes(((File) data).toPath());
			}
			if (data instanceof BufferedImage) {
				ByteArrayOutputStream out = new ByteArrayOutputStream();
				ImageIO.write((BufferedImage) data, "png", out);
				return out.toByteArray();
			}
		}
		catch (IOException e) {
			throw new APIException("Could not read the ECG file", e);
		}
		throw new APIException("Could not read the ECG file (" + (data == null ? "empty" : data.getClass().getName()) + ")");
	}

	/** File type from its first bytes (the stored mime type is not always reliable). */
	static String sniff(byte[] b) {
		if (b.length > 8 && (b[0] & 0xff) == 0x89 && b[1] == 'P' && b[2] == 'N' && b[3] == 'G') {
			return "image/png";
		}
		if (b.length > 3 && (b[0] & 0xff) == 0xff && (b[1] & 0xff) == 0xd8) {
			return "image/jpeg";
		}
		if (b.length > 6 && b[0] == 'G' && b[1] == 'I' && b[2] == 'F') {
			return "image/gif";
		}
		if (b.length > 12 && b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F' && b[8] == 'W' && b[9] == 'E'
		        && b[10] == 'B' && b[11] == 'P') {
			return "image/webp";
		}
		if (b.length > 5 && b[0] == '%' && b[1] == 'P' && b[2] == 'D' && b[3] == 'F') {
			return "application/pdf";
		}
		return null;
	}

	private static Map<String, Object> state(String status, String error) {
		Map<String, Object> m = new LinkedHashMap<>();
		m.put("status", status);
		if (error != null) {
			m.put("error", error);
		}
		m.put("updatedAt", Instant.now().toString());
		return m;
	}

	@PreDestroy
	public void shutdown() {
		executor.shutdownNow();
	}
}
