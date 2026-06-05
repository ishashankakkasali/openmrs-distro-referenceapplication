(globalThis["webpackChunk_openmrs_esm_referral_fulfillment_app"] = globalThis["webpackChunk_openmrs_esm_referral_fulfillment_app"] || []).push([[59],{

/***/ 666
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  importTranslation: () => (/* binding */ importTranslation),
  recordReferralResponseAction: () => (/* binding */ recordReferralResponseAction),
  referralsDashboard: () => (/* binding */ referralsDashboard),
  referralsDashboardLink: () => (/* binding */ referralsDashboardLink),
  startupApp: () => (/* binding */ startupApp)
});

// EXTERNAL MODULE: consume shared module (default) @openmrs/esm-framework@* (singleton)
var esm_framework_singleton_ = __webpack_require__(251);
;// ./src/config-schema.ts

const configSchema = {
    formUuid: {
        _type: esm_framework_singleton_.Type.UUID,
        _description: 'UUID of the Referral Response form',
        _default: '2dcc7696-66b4-42fd-95c0-50603e0e2f4e'
    },
    orderTypeUuid: {
        _type: esm_framework_singleton_.Type.UUID,
        _description: 'UUID of the Referral OrderType. Used to filter which order rows show the action.',
        _default: '778a9dc6-87d9-49c1-83d9-caa01041a8ad'
    },
    fulfillerComment: {
        _type: esm_framework_singleton_.Type.String,
        _description: 'Comment recorded on the order when it is closed.',
        _default: 'Closed by Referral Response form'
    },
    encounterTypeUuid: {
        _type: esm_framework_singleton_.Type.UUID,
        _description: 'UUID of the Referral Response encounter type. Used by the polling fallback to detect form save.',
        _default: '479e4805-90d9-44f5-b252-333d8a687e52'
    }
};

// EXTERNAL MODULE: ./node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(848);
// EXTERNAL MODULE: consume shared module (default) react@* (singleton)
var consume_shared_module_default_react_singleton_ = __webpack_require__(403);
var consume_shared_module_default_react_singleton_default = /*#__PURE__*/__webpack_require__.n(consume_shared_module_default_react_singleton_);
// EXTERNAL MODULE: consume shared module (default) react-i18next@* (singleton)
var consume_shared_module_default_react_i18next_singleton_ = __webpack_require__(857);
// EXTERNAL MODULE: ./node_modules/@carbon/react/es/index.js + 158 modules
var es = __webpack_require__(378);
;// ./src/close-referral-order.ts

// Encode "<comment> | by: <name>" so we can render the fulfiller in the UI.
// The Order REST resource has no dedicated fulfiller field and `auditInfo.changedBy`
// is not bumped by the fulfillerdetails PATCH, so we piggyback on fulfillerComment.
const FULFILLER_TAG = ' | by: ';
function currentUserDisplay() {
    try {
        const session = (0,esm_framework_singleton_.getSessionStore)().getState()?.session;
        return session?.currentProvider?.person?.display ?? session?.user?.person?.display ?? session?.user?.display ?? session?.user?.username ?? '';
    } catch  {
        return '';
    }
}
/**
 * POST /ws/rest/v1/order/{uuid}/fulfillerdetails
 * Sets fulfillerStatus = COMPLETED on a Referral order.
 */ async function closeReferralOrder({ orderUuid, comment }) {
    const fulfiller = currentUserDisplay();
    const fulfillerComment = fulfiller ? `${comment}${FULFILLER_TAG}${fulfiller}` : comment;
    try {
        await (0,esm_framework_singleton_.openmrsFetch)(`/ws/rest/v1/order/${orderUuid}/fulfillerdetails`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: {
                fulfillerStatus: 'COMPLETED',
                fulfillerComment
            }
        });
        (0,esm_framework_singleton_.showSnackbar)({
            kind: 'success',
            title: 'Referral closed',
            subtitle: 'Order marked as completed',
            isLowContrast: true
        });
    } catch (err) {
        console.error('Failed to close referral order', err);
        (0,esm_framework_singleton_.showSnackbar)({
            kind: 'error',
            title: 'Could not close referral',
            subtitle: err instanceof Error ? err.message : 'Unknown error'
        });
    }
}
/**
 * POST /ws/rest/v1/order/{uuid}/fulfillerdetails
 * Sets fulfillerStatus = DECLINED on a Referral order. Used when the fulfiller
 * cannot/will-not act on the referral. The decliner's display name is recorded
 * in fulfillerComment via the same `<comment> | by: <name>` convention used by
 * closeReferralOrder so the dashboard can render "Declined by".
 */ async function declineReferralOrder({ orderUuid, comment }) {
    const fulfiller = currentUserDisplay();
    const fulfillerComment = fulfiller ? `${comment}${FULFILLER_TAG}${fulfiller}` : comment;
    try {
        await (0,esm_framework_singleton_.openmrsFetch)(`/ws/rest/v1/order/${orderUuid}/fulfillerdetails`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: {
                fulfillerStatus: 'DECLINED',
                fulfillerComment
            }
        });
        (0,esm_framework_singleton_.showSnackbar)({
            kind: 'success',
            title: 'Referral declined',
            subtitle: 'Order marked as declined',
            isLowContrast: true
        });
    } catch (err) {
        console.error('Failed to decline referral order', err);
        (0,esm_framework_singleton_.showSnackbar)({
            kind: 'error',
            title: 'Could not decline referral',
            subtitle: err instanceof Error ? err.message : 'Unknown error'
        });
    }
}
/**
 * POST /ws/rest/v1/order
 *
 * Creates a DISCONTINUE order that references the original via
 * `previousOrder`. This produces a *new* row in the `orders` table with a
 * fresh `date_created`, and stamps `date_stopped` on the original. Both rows
 * are then visible to FHIR `ServiceRequest?_lastUpdated=gt<X>` polling, which
 * is the only reliable change-data-capture surface for orders (the
 * `/fulfillerdetails` endpoint bypasses audit columns — see
 * docs/referral-close-loop-implementation.md).
 *
 * This call is best-effort: failures are logged + surfaced as a low-priority
 * warning snackbar but never thrown, because the user-visible state
 * (fulfillerStatus) has already been updated by the time we get here.
 */ async function discontinueReferralOrder({ order, patientUuid, reason }) {
    const patient = patientUuid ?? order.patient?.uuid;
    const encounter = order.encounter?.uuid;
    const orderer = order.orderer?.uuid;
    const concept = order.concept?.uuid;
    const careSetting = order.careSetting?.uuid;
    const orderType = order.orderType?.uuid;
    // Skip silently if we don't have the minimum context to compose the body.
    if (!patient || !encounter || !orderer || !concept || !careSetting || !orderType) {
        console.warn('[esm-referral-fulfillment] skipping DISCONTINUE — missing fields', {
            patient: !!patient,
            encounter: !!encounter,
            orderer: !!orderer,
            concept: !!concept,
            careSetting: !!careSetting,
            orderType: !!orderType
        });
        return;
    }
    try {
        await (0,esm_framework_singleton_.openmrsFetch)('/ws/rest/v1/order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: {
                // The Referral OrderType is backed by org.openmrs.TestOrder so the
                // FHIR module exposes referrals as ServiceRequest. The REST resource
                // discriminator must match the underlying class.
                type: 'testorder',
                action: 'DISCONTINUE',
                previousOrder: order.uuid,
                patient,
                encounter,
                orderer,
                careSetting,
                concept,
                orderType,
                orderReasonNonCoded: reason
            }
        });
    } catch (err) {
        // Swallow — the fulfiller-status flip already succeeded; the FHIR
        // change-data-capture is a downstream concern and shouldn't block the user.
        console.warn('[esm-referral-fulfillment] DISCONTINUE post failed', err);
        (0,esm_framework_singleton_.showSnackbar)({
            kind: 'warning',
            title: 'Order closed but downstream sync may be delayed',
            subtitle: err instanceof Error ? err.message : 'Could not record discontinuation — external systems may not see this change immediately.',
            isLowContrast: true
        });
    }
}

;// ./src/record-referral-response.component.tsx






const RecordReferralResponseAction = (props)=>{
    const { t } = (0,consume_shared_module_default_react_i18next_singleton_.useTranslation)();
    const config = (0,esm_framework_singleton_.useConfig)();
    const order = props.order ?? props.orderItem;
    // DEBUG: log entire props shape to discover what the slot actually passes
    // eslint-disable-next-line no-console
    console.log('[esm-referral-fulfillment] slot props =', props);
    // The slot we attach to (`order-detail-slot`) renders for every generic
    // Order (type === 'order'). Filter to only the Referral OrderType so we
    // don't pollute other order detail panels.
    const isReferral = order?.orderType?.uuid === config.orderTypeUuid;
    const handleClick = (0,consume_shared_module_default_react_singleton_.useCallback)(()=>{
        if (!order?.uuid) {
            console.warn('[esm-referral-fulfillment] No order context available; aborting');
            return;
        }
        (0,esm_framework_singleton_.launchWorkspace)('patient-form-entry-workspace', {
            workspaceTitle: t('referralResponseTitle', 'Referral response — {{orderNumber}}', {
                orderNumber: order.orderNumber ?? order.uuid.slice(0, 8)
            }),
            mutateForm: ()=>{},
            formInfo: {
                formUuid: config.formUuid,
                encounterUuid: '',
                additionalProps: {
                    orderUuid: order.uuid,
                    orderNumber: order.orderNumber ?? '',
                    orderInstructions: order.instructions ?? '',
                    orderAccessionNumber: order.accessionNumber ?? '',
                    orderUrgency: order.urgency ?? '',
                    orderConceptDisplay: order.concept?.display ?? ''
                }
            },
            // Fired by the workspace framework when the user closes the workspace
            // after a successful save. The form-engine triggers `onSubmit` first;
            // we hook the workspace close to drive the order state change.
            closeWorkspaceWithSavedChanges: ()=>{
                void closeReferralOrder({
                    orderUuid: order.uuid,
                    comment: config.fulfillerComment
                });
            }
        });
    }, [
        order,
        config,
        t
    ]);
    // Hide unless this is a Referral order that is not yet completed
    if (!isReferral || order?.fulfillerStatus === 'COMPLETED') {
        return null;
    }
    return /*#__PURE__*/ (0,jsx_runtime.jsx)("div", {
        style: {
            padding: '0.5rem 1rem'
        },
        children: /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Button */.$nd, {
            kind: "tertiary",
            size: "sm",
            onClick: handleClick,
            children: t('recordReferralResponse', 'Record referral response')
        })
    });
};
/* harmony default export */ const record_referral_response_component = (RecordReferralResponseAction);

;// ./src/dashboard-link.component.tsx



const dashboardMeta = {
    path: 'Referrals',
    title: 'Referrals'
};
const ReferralsDashboardLink = ({ basePath })=>{
    return /*#__PURE__*/ (0,jsx_runtime.jsxs)(esm_framework_singleton_.ConfigurableLink, {
        to: `${basePath}/${dashboardMeta.path}`,
        className: "cds--side-nav__link",
        children: [
            /*#__PURE__*/ (0,jsx_runtime.jsx)("span", {
                // Mirror Carbon's `cds--side-nav__icon` slot used by sibling links so the
                // label aligns with the others (icons live in a 16px-wide column with
                // 0.5rem inline padding).
                className: "cds--side-nav__icon",
                style: {
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                },
                children: /*#__PURE__*/ (0,jsx_runtime.jsx)("svg", {
                    // The styleguide sprite symbol uses a 16x16 viewBox (path is M16 0H0V16H16V0Z).
                    className: "omrs-icon",
                    "aria-hidden": "true",
                    width: 16,
                    height: 16,
                    viewBox: "0 0 16 16",
                    style: {
                        fill: 'currentColor'
                    },
                    children: /*#__PURE__*/ (0,jsx_runtime.jsx)("use", {
                        href: "#omrs-icon-referral-order"
                    })
                })
            }),
            /*#__PURE__*/ (0,jsx_runtime.jsx)("span", {
                className: "cds--side-nav__link-text",
                children: dashboardMeta.title
            })
        ]
    });
};
/* harmony default export */ const dashboard_link_component = (ReferralsDashboardLink);

;// ./src/referrals-dashboard.component.tsx






// `launchWorkspace2` is the new (workspaces2) launcher; not yet in this package's
// type definitions. Cast through framework module to call it without bundling.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const framework = __webpack_require__(251);
const launchWorkspace2 = framework.launchWorkspace2 ?? framework.launchWorkspace;
const ReferralsDashboard = (props)=>{
    const { t } = (0,consume_shared_module_default_react_i18next_singleton_.useTranslation)();
    const config = (0,esm_framework_singleton_.useConfig)();
    const patientUuid = props.patientUuid ?? props.patient?.id ?? props.patient?.uuid;
    const [orders, setOrders] = (0,consume_shared_module_default_react_singleton_.useState)(null);
    const [error, setError] = (0,consume_shared_module_default_react_singleton_.useState)(null);
    // Decline modal state. Kept locally because the modal is small and tightly
    // coupled to the dashboard's Decline action.
    const [declineTarget, setDeclineTarget] = (0,consume_shared_module_default_react_singleton_.useState)(null);
    const [declineReason, setDeclineReason] = (0,consume_shared_module_default_react_singleton_.useState)(null);
    const [declineNotes, setDeclineNotes] = (0,consume_shared_module_default_react_singleton_.useState)('');
    const [declineSubmitting, setDeclineSubmitting] = (0,consume_shared_module_default_react_singleton_.useState)(false);
    // Structured decline reasons. Keep this list short and clinically meaningful;
    // free-text "Other (specify in notes)" is the escape hatch.
    const declineReasons = consume_shared_module_default_react_singleton_default().useMemo(()=>[
            t('declineReasonWrongPatient', 'Wrong patient'),
            t('declineReasonAlreadySeenElsewhere', 'Patient already seen at another facility'),
            t('declineReasonRefusedCare', 'Patient refused care'),
            t('declineReasonOutOfScope', 'Out of scope for this facility'),
            t('declineReasonDuplicate', 'Duplicate referral'),
            t('declineReasonInsufficientInfo', 'Insufficient clinical information'),
            t('declineReasonOther', 'Other (specify in notes)')
        ], [
        t
    ]);
    const loadOrders = (0,consume_shared_module_default_react_singleton_.useCallback)(async ()=>{
        if (!patientUuid) return;
        try {
            const res = await (0,esm_framework_singleton_.openmrsFetch)(`/ws/rest/v1/order?patient=${patientUuid}&v=full`);
            const all = res.data?.results ?? [];
            // Hide DISCONTINUE revision rows: they are immutable audit siblings
            // generated by close-the-loop and should not appear as a separate
            // referral in the UI. The original NEW row continues to reflect status.
            const referrals = all.filter((o)=>o.orderType?.uuid === config.orderTypeUuid && (o.action ?? 'NEW').toUpperCase() !== 'DISCONTINUE');
            setOrders(referrals);
        } catch (e) {
            setError(e?.message ?? String(e));
        }
    }, [
        patientUuid,
        config.orderTypeUuid
    ]);
    (0,consume_shared_module_default_react_singleton_.useEffect)(()=>{
        void loadOrders();
    }, [
        loadOrders
    ]);
    // Track timers so we can clean up on unmount.
    const pollTimers = (0,consume_shared_module_default_react_singleton_.useRef)([]);
    (0,consume_shared_module_default_react_singleton_.useEffect)(()=>()=>pollTimers.current.forEach((t)=>window.clearTimeout(t)), []);
    const closeAndReload = (0,consume_shared_module_default_react_singleton_.useCallback)(async (order, responseEncounterUuid)=>{
        try {
            // ─── DISCONTINUE FIRST ───────────────────────────────────────────
            // Create the DISCONTINUE order BEFORE marking COMPLETED so the FHIR2
            // module adds `basedOn → ServiceRequest` to the response Encounter as
            // early as possible. The OpenMRS emitter adaptor enriches the encounter
            // with the source-referral-order extension by following basedOn; if we
            // delay this, the emitter picks up the encounter without the link.
            let resolvedEncUuid = responseEncounterUuid;
            if (!resolvedEncUuid) {
                try {
                    const encRes = await (0,esm_framework_singleton_.openmrsFetch)(`/ws/rest/v1/encounter?patient=${patientUuid}&encounterType=${config.encounterTypeUuid}&v=custom:(uuid)&limit=1&order=desc`);
                    resolvedEncUuid = encRes.data?.results?.[0]?.uuid;
                } catch  {
                /* fall back to original encounter */ }
            }
            if (resolvedEncUuid) {
                // eslint-disable-next-line no-console
                console.log('[referral-fulfillment] firing DISCONTINUE for', order.uuid, 'in encounter', resolvedEncUuid);
                const orderData = {
                    ...order,
                    encounter: {
                        uuid: resolvedEncUuid
                    }
                };
                try {
                    await discontinueReferralOrder({
                        order: orderData,
                        patientUuid,
                        reason: config.fulfillerComment
                    });
                } catch (err) {
                    // eslint-disable-next-line no-console
                    console.warn('[referral-fulfillment] DISCONTINUE failed (best-effort)', err);
                }
            } else {
                // eslint-disable-next-line no-console
                console.warn('[referral-fulfillment] no response encounter UUID; skipping DISCONTINUE');
            }
            // ─── THEN MARK COMPLETED ─────────────────────────────────────────
            await closeReferralOrder({
                orderUuid: order.uuid,
                comment: config.fulfillerComment
            });
            // eslint-disable-next-line no-console
            console.log('[referral-fulfillment] order closed', order.uuid);
            await loadOrders();
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error('[referral-fulfillment] close failed', err);
        }
    }, [
        config,
        loadOrders,
        patientUuid
    ]);
    const handleRecord = (0,consume_shared_module_default_react_singleton_.useCallback)(async (order)=>{
        try {
            // Fetch full form object — workspaces2 launcher expects the form, not just a UUID.
            const formRes = await (0,esm_framework_singleton_.openmrsFetch)(`/ws/rest/v1/form/${config.formUuid}?v=full`);
            const form = formRes.data;
            // The workspace title bar reads `form.display`; mutate it so the order
            // number is visible in the workspace header. (windowProps.title is ignored
            // by the patient-forms wrapper in this build.)
            const baseDisplay = form.display || form.name || 'Referral Response';
            form.display = order.orderNumber ? `${baseDisplay} — ${order.orderNumber}` : baseDisplay;
            // Snapshot most-recent referral-response encounter time BEFORE launching, so
            // the poll below can detect a NEW one created by the form engine.
            const encUrl = `/ws/rest/v1/encounter?patient=${patientUuid}&encounterType=${config.encounterTypeUuid}&v=custom:(uuid,encounterDatetime)&limit=1&order=desc`;
            let lastEncounterUuid = null;
            try {
                const r = await (0,esm_framework_singleton_.openmrsFetch)(encUrl);
                lastEncounterUuid = r.data?.results?.[0]?.uuid ?? null;
            } catch  {
            /* ignore */ }
            const clickedAt = Date.now();
            // eslint-disable-next-line no-console
            console.log('[referral-fulfillment] launching form workspace', {
                orderNumber: order.orderNumber,
                orderUuid: order.uuid
            });
            launchWorkspace2('patient-form-entry-workspace', {
                form,
                encounterUuid: '',
                additionalProps: {
                    orderUuid: order.uuid,
                    orderNumber: order.orderNumber,
                    orderInstructions: order.instructions ?? '',
                    orderAccessionNumber: order.accessionNumber ?? '',
                    orderUrgency: order.urgency ?? '',
                    orderConceptDisplay: order.concept?.display ?? ''
                },
                handlePostResponse: (encounter)=>{
                    // eslint-disable-next-line no-console
                    console.log('[referral-fulfillment] handlePostResponse fired', {
                        orderUuid: order.uuid,
                        encounter
                    });
                    const encUuid = encounter?.uuid ?? encounter?.id;
                    void closeAndReload(order, encUuid);
                }
            }, {
                // The order # is shown in the workspace title bar so the clinician
                // always sees which referral they are responding to.
                title: t('referralResponseTitle', 'Referral response — {{orderNumber}}', {
                    orderNumber: order.orderNumber ?? ''
                })
            });
            // Fallback path: poll for a new Referral Response encounter for this patient.
            // Strict match: the encounter MUST be newer than our snapshot AND must contain
            // at least one obs with formFieldPath starting with "rfe-forms-" (proving it
            // came from the React form engine, i.e. our Referral Response form). Because
            // workspaces2 only allows one patient-form-entry-workspace at a time, the
            // newly-saved encounter unambiguously corresponds to the order we clicked.
            let stopped = false;
            const isFromOurForm = (enc)=>{
                if (!enc) return false;
                if (clickedAt && enc.encounterDatetime) {
                    // Skip encounters created before the click (clock skew tolerance: 60s).
                    const ts = new Date(enc.encounterDatetime).getTime();
                    if (ts + 60000 < clickedAt) return false;
                }
                const walk = (obs)=>!!obs?.some((o)=>{
                        if (typeof o?.formFieldPath === 'string' && o.formFieldPath.startsWith('rfe-forms-')) return true;
                        if (Array.isArray(o?.groupMembers) && walk(o.groupMembers)) return true;
                        return false;
                    });
                return walk(enc.obs ?? []);
            };
            const poll = async ()=>{
                if (stopped) return;
                try {
                    const r = await (0,esm_framework_singleton_.openmrsFetch)(encUrl);
                    const newest = r.data?.results?.[0]?.uuid ?? null;
                    if (newest && newest !== lastEncounterUuid) {
                        try {
                            const full = await (0,esm_framework_singleton_.openmrsFetch)(`/ws/rest/v1/encounter/${newest}?v=full`);
                            if (isFromOurForm(full.data)) {
                                stopped = true;
                                // eslint-disable-next-line no-console
                                console.log('[referral-fulfillment] poll matched encounter for order', {
                                    encounter: newest,
                                    order: order.uuid
                                });
                                await closeAndReload(order, newest);
                                return;
                            }
                            // eslint-disable-next-line no-console
                            console.log('[referral-fulfillment] new encounter does not look like our form, ignoring', newest);
                        } catch  {
                        /* ignore — try again next tick */ }
                    }
                } catch  {
                /* ignore */ }
                const id = window.setTimeout(poll, 2000);
                pollTimers.current.push(id);
            };
            const id = window.setTimeout(poll, 2000);
            pollTimers.current.push(id);
            // Hard stop after 60s.
            const stopId = window.setTimeout(()=>{
                stopped = true;
            }, 60000);
            pollTimers.current.push(stopId);
        } catch (e) {
            setError(e?.message ?? String(e));
        }
    }, [
        config,
        patientUuid,
        closeAndReload,
        t
    ]);
    const handleManualClose = (0,consume_shared_module_default_react_singleton_.useCallback)(async (order)=>{
        // Retained for potential admin/debug use; no UI surface exposes it now.
        // The referral is otherwise marked COMPLETED only when the Referral
        // Response form is submitted (see handleRecord/closeAndReload).
        await closeReferralOrder({
            orderUuid: order.uuid,
            comment: config.fulfillerComment
        });
        void loadOrders();
    }, [
        config,
        loadOrders
    ]);
    // Suppress unused-var warnings while keeping the helper available.
    void handleManualClose;
    const handleDecline = (0,consume_shared_module_default_react_singleton_.useCallback)((order)=>{
        // Open the structured-decline modal; submission happens in submitDecline.
        setDeclineTarget(order);
        setDeclineReason(null);
        setDeclineNotes('');
    }, []);
    const closeDeclineModal = (0,consume_shared_module_default_react_singleton_.useCallback)(()=>{
        if (declineSubmitting) return;
        setDeclineTarget(null);
        setDeclineReason(null);
        setDeclineNotes('');
    }, [
        declineSubmitting
    ]);
    const submitDecline = (0,consume_shared_module_default_react_singleton_.useCallback)(async ()=>{
        if (!declineTarget || !declineReason) return;
        // Persist as "<reason>: <notes>" or just "<reason>" so the structured choice
        // is preserved at the front of the comment string.
        const trimmedNotes = declineNotes.trim();
        const comment = trimmedNotes ? `${declineReason}: ${trimmedNotes}` : declineReason;
        setDeclineSubmitting(true);
        try {
            await declineReferralOrder({
                orderUuid: declineTarget.uuid,
                comment
            });
            // Best-effort: emit a DISCONTINUE order so the change is visible to
            // FHIR ServiceRequest?_lastUpdated polling. See docs/referral-close-loop-implementation.md.
            void discontinueReferralOrder({
                order: declineTarget,
                patientUuid,
                reason: comment
            });
            setDeclineTarget(null);
            setDeclineReason(null);
            setDeclineNotes('');
            void loadOrders();
        } finally{
            setDeclineSubmitting(false);
        }
    }, [
        declineTarget,
        declineReason,
        declineNotes,
        loadOrders,
        patientUuid
    ]);
    if (!patientUuid) {
        return /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Tile */.FAs, {
            children: t('noPatient', 'No patient context')
        });
    }
    if (orders === null && !error) {
        return /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* InlineLoading */.OuH, {
            description: t('loading', 'Loading referrals…')
        });
    }
    if (error) {
        return /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Tile */.FAs, {
            children: t('errorLoading', 'Error loading referrals: {{err}}', {
                err: error
            })
        });
    }
    if ((orders?.length ?? 0) === 0) {
        return /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Tile */.FAs, {
            children: /*#__PURE__*/ (0,jsx_runtime.jsx)("p", {
                children: t('noReferrals', 'No referral orders for this patient.')
            })
        });
    }
    const headers = [
        {
            key: 'orderNumber',
            header: t('orderNumber', 'Order #')
        },
        {
            key: 'display',
            header: t('order', 'Order')
        },
        {
            key: 'dateActivated',
            header: t('dateActivated', 'Date')
        },
        {
            key: 'status',
            header: t('status', 'Status')
        },
        {
            key: 'action',
            header: ''
        }
    ];
    const rows = (orders ?? []).map((o)=>({
            id: o.uuid,
            orderNumber: o.orderNumber,
            display: o.display ?? '',
            dateActivated: o.dateActivated ? new Date(o.dateActivated).toLocaleDateString() : '',
            status: o.fulfillerStatus ?? 'PENDING',
            raw: o
        }));
    return /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
        style: {
            padding: '1rem'
        },
        children: [
            /*#__PURE__*/ (0,jsx_runtime.jsx)("style", {
                children: `.cds--css-grid h4, .patient-chart-dashboard-title { font-weight: 600 !important; }`
            }),
            /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* DataTable */.bQt, {
                rows: rows,
                headers: headers,
                children: ({ rows: dtRows, headers: dtHeaders, getHeaderProps, getRowProps, getTableProps, getExpandHeaderProps })=>/*#__PURE__*/ (0,jsx_runtime.jsxs)(es/* Table */.XIK, {
                        ...getTableProps(),
                        children: [
                            /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* TableHead */.ndF, {
                                children: /*#__PURE__*/ (0,jsx_runtime.jsxs)(es/* TableRow */.Hjg, {
                                    children: [
                                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* TableExpandHeader */.Uwq, {
                                            ...getExpandHeaderProps()
                                        }),
                                        dtHeaders.map((h)=>/*#__PURE__*/ (0,jsx_runtime.jsx)(es/* TableHeader */.A0N, {
                                                ...getHeaderProps({
                                                    header: h
                                                }),
                                                children: h.header
                                            }, h.key))
                                    ]
                                })
                            }),
                            /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* TableBody */.BFY, {
                                children: dtRows.map((row, idx)=>{
                                    const o = (orders ?? [])[idx];
                                    const completed = o?.fulfillerStatus === 'COMPLETED';
                                    const declined = o?.fulfillerStatus === 'DECLINED';
                                    // A referral is "terminal" once it's either completed or declined;
                                    // no further action buttons should be offered.
                                    const terminal = completed || declined;
                                    const fmt = (v)=>v === null || v === undefined || v === '' ? /*#__PURE__*/ (0,jsx_runtime.jsx)("span", {
                                            style: {
                                                color: '#8d8d8d'
                                            },
                                            children: "—"
                                        }) : v;
                                    const fmtDate = (v)=>v ? new Date(v).toLocaleString() : null;
                                    // The fulfiller name is encoded in fulfillerComment as `<comment> | by: <name>`
                                    // (see close-referral-order.ts). Split it for display.
                                    const splitFulfiller = (raw)=>{
                                        if (!raw) return {
                                            comment: null,
                                            by: null
                                        };
                                        const idx = raw.indexOf(' | by: ');
                                        if (idx < 0) return {
                                            comment: raw,
                                            by: null
                                        };
                                        return {
                                            comment: raw.slice(0, idx) || null,
                                            by: raw.slice(idx + ' | by: '.length) || null
                                        };
                                    };
                                    const { comment: fulfillerCommentText, by: fulfilledBy } = splitFulfiller(o?.fulfillerComment);
                                    return /*#__PURE__*/ (0,jsx_runtime.jsxs)((consume_shared_module_default_react_singleton_default()).Fragment, {
                                        children: [
                                            /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* TableExpandRow */.fZD, {
                                                ...getRowProps({
                                                    row
                                                }),
                                                children: row.cells.map((cell)=>{
                                                    if (cell.info.header === 'action') {
                                                        return /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* TableCell */.nA6, {
                                                            children: !terminal && /*#__PURE__*/ (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
                                                                children: [
                                                                    /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Button */.$nd, {
                                                                        kind: "tertiary",
                                                                        size: "sm",
                                                                        onClick: ()=>handleRecord(o),
                                                                        style: {
                                                                            marginRight: '0.5rem'
                                                                        },
                                                                        children: t('recordReferralResponse', 'Record referral response')
                                                                    }),
                                                                    /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Button */.$nd, {
                                                                        kind: "danger--ghost",
                                                                        size: "sm",
                                                                        onClick: ()=>handleDecline(o),
                                                                        children: t('decline', 'Decline')
                                                                    })
                                                                ]
                                                            })
                                                        }, cell.id);
                                                    }
                                                    if (cell.info.header === 'status') {
                                                        return /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* TableCell */.nA6, {
                                                            children: /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Tag */.vwO, {
                                                                type: completed ? 'green' : declined ? 'red' : 'gray',
                                                                children: cell.value
                                                            })
                                                        }, cell.id);
                                                    }
                                                    return /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* TableCell */.nA6, {
                                                        children: cell.value
                                                    }, cell.id);
                                                })
                                            }),
                                            /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* TableExpandedRow */.cwJ, {
                                                colSpan: dtHeaders.length + 2,
                                                children: /*#__PURE__*/ (0,jsx_runtime.jsx)("div", {
                                                    style: {
                                                        padding: '0.5rem 1rem'
                                                    },
                                                    children: /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* StructuredListWrapper */.r9c, {
                                                        isCondensed: true,
                                                        selection: false,
                                                        ariaLabel: "Referral details",
                                                        children: /*#__PURE__*/ (0,jsx_runtime.jsxs)(es/* StructuredListBody */.GRJ, {
                                                            children: [
                                                                /*#__PURE__*/ (0,jsx_runtime.jsxs)(es/* StructuredListRow */.Cvq, {
                                                                    children: [
                                                                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* StructuredListCell */.Um2, {
                                                                            noWrap: true,
                                                                            children: t('referralType', 'Referral type')
                                                                        }),
                                                                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* StructuredListCell */.Um2, {
                                                                            children: fmt(o?.concept?.display)
                                                                        }),
                                                                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* StructuredListCell */.Um2, {
                                                                            noWrap: true,
                                                                            children: t('referenceNumber', 'Reference number')
                                                                        }),
                                                                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* StructuredListCell */.Um2, {
                                                                            children: fmt(o?.accessionNumber)
                                                                        })
                                                                    ]
                                                                }),
                                                                /*#__PURE__*/ (0,jsx_runtime.jsxs)(es/* StructuredListRow */.Cvq, {
                                                                    children: [
                                                                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* StructuredListCell */.Um2, {
                                                                            noWrap: true,
                                                                            children: t('instructions', 'Instructions')
                                                                        }),
                                                                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* StructuredListCell */.Um2, {
                                                                            children: fmt(o?.instructions)
                                                                        }),
                                                                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* StructuredListCell */.Um2, {
                                                                            noWrap: true,
                                                                            children: t('urgency', 'Priority')
                                                                        }),
                                                                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* StructuredListCell */.Um2, {
                                                                            children: fmt(o?.urgency)
                                                                        })
                                                                    ]
                                                                }),
                                                                /*#__PURE__*/ (0,jsx_runtime.jsxs)(es/* StructuredListRow */.Cvq, {
                                                                    children: [
                                                                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* StructuredListCell */.Um2, {
                                                                            noWrap: true,
                                                                            children: t('orderedBy', 'Ordered by')
                                                                        }),
                                                                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* StructuredListCell */.Um2, {
                                                                            children: fmt(o?.orderer?.display)
                                                                        }),
                                                                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* StructuredListCell */.Um2, {
                                                                            noWrap: true,
                                                                            children: t('dateActivatedFull', 'Date activated')
                                                                        }),
                                                                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* StructuredListCell */.Um2, {
                                                                            children: fmt(fmtDate(o?.dateActivated))
                                                                        })
                                                                    ]
                                                                }),
                                                                /*#__PURE__*/ (0,jsx_runtime.jsxs)(es/* StructuredListRow */.Cvq, {
                                                                    children: [
                                                                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* StructuredListCell */.Um2, {
                                                                            noWrap: true,
                                                                            children: t('careSetting', 'Care setting')
                                                                        }),
                                                                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* StructuredListCell */.Um2, {
                                                                            children: fmt(o?.careSetting?.display)
                                                                        }),
                                                                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* StructuredListCell */.Um2, {
                                                                            noWrap: true,
                                                                            children: t('orderEncounter', 'Source encounter')
                                                                        }),
                                                                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* StructuredListCell */.Um2, {
                                                                            children: fmt(o?.encounter?.display)
                                                                        })
                                                                    ]
                                                                }),
                                                                /*#__PURE__*/ (0,jsx_runtime.jsxs)(es/* StructuredListRow */.Cvq, {
                                                                    children: [
                                                                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* StructuredListCell */.Um2, {
                                                                            noWrap: true,
                                                                            children: t('fulfilledBy', 'Fulfilled by')
                                                                        }),
                                                                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* StructuredListCell */.Um2, {
                                                                            children: terminal ? fmt(fulfilledBy) : /*#__PURE__*/ (0,jsx_runtime.jsx)("span", {
                                                                                style: {
                                                                                    color: '#8d8d8d'
                                                                                },
                                                                                children: "—"
                                                                            })
                                                                        }),
                                                                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* StructuredListCell */.Um2, {
                                                                            noWrap: true,
                                                                            children: t('fulfillerComment', 'Fulfiller comment')
                                                                        }),
                                                                        /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* StructuredListCell */.Um2, {
                                                                            children: fmt(fulfillerCommentText)
                                                                        })
                                                                    ]
                                                                })
                                                            ]
                                                        })
                                                    })
                                                })
                                            })
                                        ]
                                    }, row.id);
                                })
                            })
                        ]
                    })
            }),
            /*#__PURE__*/ (0,jsx_runtime.jsxs)(es/* Modal */.aFV, {
                open: declineTarget !== null,
                modalHeading: t('declineReferralHeading', 'Decline referral {{orderNumber}}', {
                    orderNumber: declineTarget?.orderNumber ?? ''
                }),
                primaryButtonText: declineSubmitting ? t('declining', 'Declining…') : t('confirmDecline', 'Decline referral'),
                secondaryButtonText: t('cancel', 'Cancel'),
                primaryButtonDisabled: !declineReason || declineSubmitting,
                danger: true,
                onRequestClose: closeDeclineModal,
                onRequestSubmit: ()=>void submitDecline(),
                children: [
                    /*#__PURE__*/ (0,jsx_runtime.jsx)("p", {
                        style: {
                            marginBottom: '1rem'
                        },
                        children: t('declineModalDescription', 'Choose a reason for declining this referral. The reason and any notes are saved with the order and visible to the source system.')
                    }),
                    /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* Dropdown */.msM, {
                        id: "referral-decline-reason",
                        titleText: t('reason', 'Reason'),
                        label: t('selectReason', 'Select a reason'),
                        items: declineReasons,
                        selectedItem: declineReason,
                        onChange: ({ selectedItem })=>setDeclineReason(selectedItem)
                    }),
                    /*#__PURE__*/ (0,jsx_runtime.jsx)("div", {
                        style: {
                            marginTop: '1rem'
                        },
                        children: /*#__PURE__*/ (0,jsx_runtime.jsx)(es/* TextArea */.fs1, {
                            id: "referral-decline-notes",
                            labelText: t('additionalNotes', 'Additional notes (optional)'),
                            placeholder: t('notesPlaceholder', 'Any clinical context for the source system'),
                            value: declineNotes,
                            onChange: (e)=>setDeclineNotes(e.target.value),
                            rows: 3,
                            maxCount: 500,
                            enableCounter: true
                        })
                    })
                ]
            })
        ]
    });
};
/* harmony default export */ const referrals_dashboard_component = (ReferralsDashboard);

;// ./src/index.ts
/**
 * @openmrs/esm-referral-fulfillment-app
 *
 * Adds a "Record referral response" overflow-menu action to every Referral order
 * row in the patient-chart Orders widget. Clicking it launches the Referral
 * Response form workspace pre-bound to the clicked order, and on save closes the
 * order via POST /order/{uuid}/fulfillerdetails.
 */ 




const moduleName = '@openmrs/esm-referral-fulfillment-app';
const options = {
    featureName: 'referral-fulfillment',
    moduleName
};
const importTranslation = __webpack_require__(767);
function startupApp() {
    (0,esm_framework_singleton_.defineConfigSchema)(moduleName, configSchema);
}
const recordReferralResponseAction = (0,esm_framework_singleton_.getSyncLifecycle)(record_referral_response_component, options);
const referralsDashboardLink = (0,esm_framework_singleton_.getSyncLifecycle)(dashboard_link_component, options);
const referralsDashboard = (0,esm_framework_singleton_.getSyncLifecycle)(referrals_dashboard_component, options);


/***/ },

/***/ 767
(module, __unused_webpack_exports, __webpack_require__) {

var map = {
	"./en.json": [
		300,
		[
			300
		]
	]
};
function webpackAsyncContext(req) {
	try {
		if(!__webpack_require__.o(map, req)) {
			return Promise.resolve().then(() => {
	var e = new Error("Cannot find module '" + req + "'");
	e.code = 'MODULE_NOT_FOUND';
	throw e;
});
		}
	} catch(err) {
		return Promise.reject(err);
	}

	var ids = map[req], id = ids[0];
	return __webpack_require__.e(ids[1][0]).then(() => (__webpack_require__(id)));
}
webpackAsyncContext.keys = () => (Object.keys(map));
webpackAsyncContext.id = 767;
module.exports = webpackAsyncContext;

/***/ }

}]);