package org.openmrs.module.ecgai;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.Duration;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import dev.langchain4j.data.image.Image;
import dev.langchain4j.data.message.Content;
import dev.langchain4j.data.message.ImageContent;
import dev.langchain4j.data.message.PdfFileContent;
import dev.langchain4j.data.message.TextContent;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.data.pdf.PdfFile;
import dev.langchain4j.model.anthropic.AnthropicChatModel;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.model.chat.request.ChatRequest;
import dev.langchain4j.model.chat.request.ResponseFormat;
import dev.langchain4j.model.chat.request.ResponseFormatType;
import dev.langchain4j.model.chat.request.json.JsonArraySchema;
import dev.langchain4j.model.chat.request.json.JsonObjectSchema;
import dev.langchain4j.model.chat.request.json.JsonSchema;
import dev.langchain4j.model.chat.request.json.JsonStringSchema;
import dev.langchain4j.model.chat.response.ChatResponse;
import dev.langchain4j.model.googleai.GoogleAiGeminiChatModel;
import dev.langchain4j.model.output.FinishReason;

/**
 * Sends an ECG file and the cardiologist prompt to the configured LLM (through LangChain4j) and returns the structured
 * read as JSON. The prompt (prompt.txt) is kept as written by the clinical team; output-guide.txt maps its three
 * sections onto the JSON fields.
 */
public class EcgReader {

	public static final String IMMEDIATE_CATH_LAB_REFERRAL = "IMMEDIATE_CATH_LAB_REFERRAL";

	public static final String NO_REFERRAL_SERIAL_ECG_MONITORING = "NO_REFERRAL_SERIAL_ECG_MONITORING";

	static final List<String> FIELDS = Arrays.asList("isTwelveLeadEcg", "ecgInterpretation", "meetsStemiOmiCriteria",
	    "headline", "suggestedDiagnosis", "disposition", "dispositionText", "nextStepsIfPciWithin120Min",
	    "nextStepsIfPciBeyond120Min");

	/** The bundled clinical prompt; ECG_AI_PROMPT_FILE replaces it (re-read on every call, so edits apply at once). */
	private static final String BUNDLED_PROMPT = resource("prompt.txt");

	/** Maps the prompt's three sections onto the JSON fields; tied to the schema, so always the bundled one. */
	private static final String OUTPUT_GUIDE = resource("output-guide.txt");

	private static final ResponseFormat FORMAT = ResponseFormat.builder().type(ResponseFormatType.JSON)
	        .jsonSchema(JsonSchema.builder().name("EcgRead").rootElement(schema()).build()).build();

	private static final Duration TIMEOUT = Duration.ofMinutes(4);

	private final ObjectMapper mapper = new ObjectMapper();

	/** The provider has no API key, or rejected it. */
	public static class NotConfiguredException extends RuntimeException {

		public NotConfiguredException(String message) {
			super(message);
		}
	}

	/** The ECG read as JSON (the fields in {@link #FIELDS}). */
	public ObjectNode read(EcgAiSettings settings, byte[] data, String mimeType) {
		if (!settings.isConfigured()) {
			throw new NotConfiguredException("No API key for provider '" + settings.provider() + "'");
		}
		ChatModel model = model(settings);
		String b64 = Base64.getEncoder().encodeToString(data);
		Content file = "application/pdf".equals(mimeType)
		        ? PdfFileContent.from(PdfFile.builder().base64Data(b64).mimeType(mimeType).build())
		        : ImageContent.from(Image.builder().base64Data(b64).mimeType(mimeType).build());
		ChatRequest request = ChatRequest.builder().messages(UserMessage.from(file, TextContent.from(prompt(settings))))
		        .responseFormat(FORMAT).build();

		ChatResponse response;
		try {
			response = model.chat(request);
		}
		catch (RuntimeException e) {
			String msg = String.valueOf(e.getMessage());
			if (msg.contains("401") || msg.contains("403") || msg.toLowerCase().contains("api key")
			        || msg.contains("authentication_error") || msg.contains("API_KEY_INVALID")) {
				throw new NotConfiguredException(settings.provider() + " rejected the API key: " + shorten(msg));
			}
			throw new IllegalStateException(settings.provider() + " request failed: " + shorten(msg), e);
		}

		FinishReason finish = response.finishReason();
		if (finish == FinishReason.CONTENT_FILTER) {
			throw new IllegalStateException("The model declined to interpret this file");
		}
		if (finish == FinishReason.LENGTH) {
			throw new IllegalStateException("The model's answer was cut off (output token limit)");
		}
		String text = response.aiMessage() == null ? null : response.aiMessage().text();
		if (text == null || text.isBlank()) {
			throw new IllegalStateException("The model returned no answer");
		}
		return validate(text);
	}

	private ChatModel model(EcgAiSettings s) {
		if (EcgAiSettings.ANTHROPIC.equals(s.provider())) {
			AnthropicChatModel.AnthropicChatModelBuilder b = AnthropicChatModel.builder().apiKey(s.apiKey())
			        .modelName(s.model()).maxTokens(16000).thinkingType("adaptive").timeout(TIMEOUT).maxRetries(2);
			if (s.baseUrl() != null) {
				b.baseUrl(s.baseUrl());
			}
			return b.build();
		}
		if (EcgAiSettings.GEMINI.equals(s.provider())) {
			GoogleAiGeminiChatModel.GoogleAiGeminiChatModelBuilder b = GoogleAiGeminiChatModel.builder()
			        .apiKey(s.apiKey()).modelName(s.model()).timeout(TIMEOUT);
			b.maxRetries(2);
			if (s.baseUrl() != null) {
				b.baseUrl(s.baseUrl());
			}
			return b.build();
		}
		throw new NotConfiguredException("Unknown provider '" + s.provider() + "' (use anthropic or gemini)");
	}

	/** Parses the model's JSON and checks every field is there with the right type. */
	ObjectNode validate(String text) {
		JsonNode node;
		try {
			node = mapper.readTree(stripFences(text));
		}
		catch (IOException e) {
			throw new IllegalStateException("The model's answer was not valid JSON");
		}
		if (!(node instanceof ObjectNode)) {
			throw new IllegalStateException("The model's answer was not a JSON object");
		}
		ObjectNode o = (ObjectNode) node;
		for (String f : FIELDS) {
			if (!o.hasNonNull(f)) {
				throw new IllegalStateException("The model's answer is missing '" + f + "'");
			}
		}
		for (String f : Arrays.asList("isTwelveLeadEcg", "meetsStemiOmiCriteria")) {
			if (!o.get(f).isBoolean()) {
				throw new IllegalStateException("'" + f + "' is not true/false");
			}
		}
		for (String f : Arrays.asList("nextStepsIfPciWithin120Min", "nextStepsIfPciBeyond120Min")) {
			if (!o.get(f).isArray()) {
				throw new IllegalStateException("'" + f + "' is not a list");
			}
		}
		String d = o.get("disposition").asText();
		if (!IMMEDIATE_CATH_LAB_REFERRAL.equals(d) && !NO_REFERRAL_SERIAL_ECG_MONITORING.equals(d)) {
			throw new IllegalStateException("Unknown disposition '" + d + "'");
		}
		o.retain(FIELDS);
		return o;
	}

	private static String stripFences(String text) {
		String t = text.trim();
		if (t.startsWith("```")) {
			t = t.replaceFirst("^```[a-zA-Z]*\\s*", "").replaceFirst("\\s*```$", "");
		}
		return t;
	}

	private static JsonObjectSchema schema() {
		JsonArraySchema steps = JsonArraySchema.builder().items(new JsonStringSchema()).build();
		return JsonObjectSchema.builder()
		        .addBooleanProperty("isTwelveLeadEcg")
		        .addStringProperty("ecgInterpretation")
		        .addBooleanProperty("meetsStemiOmiCriteria")
		        .addStringProperty("headline")
		        .addStringProperty("suggestedDiagnosis")
		        .addEnumProperty("disposition", Arrays.asList(IMMEDIATE_CATH_LAB_REFERRAL, NO_REFERRAL_SERIAL_ECG_MONITORING))
		        .addStringProperty("dispositionText")
		        .addProperty("nextStepsIfPciWithin120Min", steps)
		        .addProperty("nextStepsIfPciBeyond120Min", steps)
		        .required(FIELDS)
		        .additionalProperties(false)
		        .build();
	}

	/**
	 * The clinical prompt: the file named by ECG_AI_PROMPT_FILE when that file exists, else the bundled prompt.txt. A file
	 * that exists but is empty or unreadable is an error (a broken edit must not silently fall back).
	 */
	static String prompt(EcgAiSettings settings) {
		String clinical = BUNDLED_PROMPT;
		if (settings.promptFileExists()) {
			try {
				String fromFile = new String(Files.readAllBytes(Paths.get(settings.promptFile())), StandardCharsets.UTF_8)
				        .trim();
				if (fromFile.isEmpty()) {
					throw new IllegalStateException("The prompt file " + settings.promptFile() + " is empty");
				}
				clinical = fromFile;
			}
			catch (IOException e) {
				throw new IllegalStateException("Could not read the prompt file " + settings.promptFile(), e);
			}
		}
		return clinical + "\n\n" + OUTPUT_GUIDE;
	}

	private static String resource(String name) {
		try (InputStream in = EcgReader.class.getClassLoader().getResourceAsStream(name)) {
			if (in == null) {
				throw new IllegalStateException(name + " is missing from the module");
			}
			return new String(in.readAllBytes(), StandardCharsets.UTF_8).trim();
		}
		catch (IOException e) {
			throw new IllegalStateException("Could not read " + name, e);
		}
	}

	private static String shorten(String s) {
		return s.length() > 300 ? s.substring(0, 300) + "…" : s;
	}
}
