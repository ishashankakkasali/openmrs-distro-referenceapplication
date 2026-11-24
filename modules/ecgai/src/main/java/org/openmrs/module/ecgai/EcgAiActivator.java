package org.openmrs.module.ecgai;

import org.openmrs.module.BaseModuleActivator;
import org.openmrs.module.DaemonToken;
import org.openmrs.module.DaemonTokenAware;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Keeps the module's daemon token: the AI read finishes on a background thread with no user session, and saves its
 * observation as the OpenMRS daemon user.
 */
public class EcgAiActivator extends BaseModuleActivator implements DaemonTokenAware {

	private static final Logger log = LoggerFactory.getLogger(EcgAiActivator.class);

	private static volatile DaemonToken daemonToken;

	@Override
	public void setDaemonToken(DaemonToken token) {
		daemonToken = token;
	}

	static DaemonToken getDaemonToken() {
		return daemonToken;
	}

	@Override
	public void started() {
		EcgAiSettings s = EcgAiSettings.load();
		log.info("ECG AI started: provider={}, model={}, configured={}", s.provider(), s.model(), s.isConfigured());
	}
}
