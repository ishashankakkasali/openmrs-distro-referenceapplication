package org.openmrs.module.ecgai.web;

import java.util.Map;

import org.openmrs.Obs;
import org.openmrs.Order;
import org.openmrs.api.context.Context;
import org.openmrs.module.ecgai.EcgAiService;
import org.openmrs.module.webservices.rest.web.RestConstants;
import org.openmrs.module.webservices.rest.web.response.IllegalRequestException;
import org.openmrs.module.webservices.rest.web.response.ObjectNotFoundException;
import org.openmrs.module.webservices.rest.web.v1_0.controller.BaseRestController;
import org.openmrs.util.PrivilegeConstants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * /ws/rest/v1/ecgai/... — used by the Imaging flow of the referral-fulfillment ESM.
 * <ul>
 * <li>POST interpret {orderUuid, attachmentUuid}: starts the AI read of the order's uploaded ECG</li>
 * <li>GET status/{orderUuid}: idle | running | done | failed | not_configured</li>
 * <li>GET health: provider, model, configured (no secrets)</li>
 * </ul>
 * The patient and the encounter come from the order, not from the request.
 */
@Controller
@RequestMapping("/rest/" + RestConstants.VERSION_1 + "/ecgai")
public class EcgAiController extends BaseRestController {

	@Autowired
	@Qualifier("ecgai.EcgAiService")
	private EcgAiService service;

	@RequestMapping(value = "/health", method = RequestMethod.GET)
	@ResponseBody
	public Map<String, Object> health() {
		requireLogin();
		return service.health();
	}

	@RequestMapping(value = "/status/{orderUuid}", method = RequestMethod.GET)
	@ResponseBody
	public Map<String, Object> status(@PathVariable("orderUuid") String orderUuid) {
		requireLogin();
		Context.requirePrivilege(PrivilegeConstants.GET_ORDERS);
		return service.status(orderUuid);
	}

	@RequestMapping(value = "/interpret", method = RequestMethod.POST)
	@ResponseBody
	public Map<String, Object> interpret(@RequestBody Map<String, Object> body) {
		requireLogin();
		Context.requirePrivilege(PrivilegeConstants.ADD_OBS);
		String orderUuid = string(body, "orderUuid");
		String attachmentUuid = string(body, "attachmentUuid");

		Order order = Context.getOrderService().getOrderByUuid(orderUuid);
		if (order == null) {
			throw new ObjectNotFoundException();
		}
		if (order.getEncounter() == null) {
			throw new IllegalRequestException("The order has no encounter");
		}
		Obs attachment = Context.getObsService().getObsByUuid(attachmentUuid);
		if (attachment == null || !attachment.isComplex()) {
			throw new IllegalRequestException("Attachment not found: " + attachmentUuid);
		}
		if (!attachment.getPerson().getUuid().equals(order.getPatient().getUuid())) {
			throw new IllegalRequestException("The attachment belongs to another patient");
		}
		return service.start(order, attachment);
	}

	private static void requireLogin() {
		if (!Context.isAuthenticated()) {
			throw new org.openmrs.api.APIAuthenticationException("Not logged in");
		}
	}

	private static String string(Map<String, Object> body, String key) {
		Object v = body == null ? null : body.get(key);
		if (!(v instanceof String) || ((String) v).isBlank()) {
			throw new IllegalRequestException(key + " is required");
		}
		return (String) v;
	}
}
