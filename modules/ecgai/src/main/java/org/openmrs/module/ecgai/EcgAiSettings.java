package org.openmrs.module.ecgai;

import org.apache.commons.lang3.StringUtils;
import org.openmrs.api.context.Context;

/**
 * Module settings, provider-neutral: ECG_AI_PROVIDER picks the provider, ECG_AI_MODEL and ECG_AI_API_KEY apply to it.
 * Each value comes from an environment variable first, then the module's global property, then the default. The API key
 * comes only from the environment, so it never sits in the database or shows in the admin UI.
 */
public final class EcgAiSettings {

	public static final String ANTHROPIC = "anthropic";

	public static final String GEMINI = "gemini";

	/** The model used when ECG_AI_MODEL is not set, per provider. */
	static String defaultModel(String provider) {
		if (ANTHROPIC.equals(provider)) {
			return "claude-opus-5-5";
		}
		return GEMINI.equals(provider) ? "gemini-3.1-pro-preview" : null;
	}

	private final String provider;

	private final String model;

	private final String apiKey;

	/** Optional API base URL override (a proxy, or a local stub when testing). */
	private final String baseUrl;

	private final String resultConceptUuid;

	/** Optional file that replaces the bundled clinical prompt. */
	private final String promptFile;

	private EcgAiSettings(String provider, String model, String apiKey, String baseUrl, String resultConceptUuid,
	    String promptFile) {
		this.provider = provider;
		this.model = model;
		this.apiKey = apiKey;
		this.baseUrl = baseUrl;
		this.resultConceptUuid = resultConceptUuid;
		this.promptFile = promptFile;
	}

	/** Reads the current settings (call with an OpenMRS session or daemon context so global properties resolve). */
	public static EcgAiSettings load() {
		String provider = setting("ECG_AI_PROVIDER", "ecgai.provider", GEMINI).trim().toLowerCase();
		return new EcgAiSettings(provider,
		        setting("ECG_AI_MODEL", "ecgai.model", defaultModel(provider)),
		        env("ECG_AI_API_KEY"),
		        env("ECG_AI_BASE_URL"),
		        setting("ECG_AI_CONCEPT_UUID", "ecgai.resultConceptUuid", "5a7d2c3e-1f4b-4c8a-9e6d-2b1f0c9a7e09"),
		        env("ECG_AI_PROMPT_FILE"));
	}

	private static String env(String name) {
		String v = System.getenv(name);
		return StringUtils.isBlank(v) ? null : v.trim();
	}

	private static String setting(String envName, String globalProperty, String defaultValue) {
		String v = env(envName);
		if (v != null) {
			return v;
		}
		try {
			String gp = Context.getAdministrationService().getGlobalProperty(globalProperty);
			if (StringUtils.isNotBlank(gp)) {
				return gp.trim();
			}
		}
		catch (RuntimeException e) {
			// no context on this thread: fall back to the default
		}
		return defaultValue;
	}

	public String provider() {
		return provider;
	}

	public String model() {
		return model;
	}

	public String apiKey() {
		return apiKey;
	}

	public String baseUrl() {
		return baseUrl;
	}

	public String promptFile() {
		return promptFile;
	}

	/** ECG_AI_PROMPT_FILE is set and the file is there (when missing, the bundled prompt is used). */
	public boolean promptFileExists() {
		return promptFile != null && new java.io.File(promptFile).isFile();
	}

	/** A key is set, for a provider this module knows (and so a model). */
	public boolean isConfigured() {
		return apiKey != null && model != null;
	}

	public String resultConceptUuid() {
		return resultConceptUuid;
	}
}
