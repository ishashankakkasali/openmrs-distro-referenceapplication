import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown, InlineNotification, Modal, RadioButton, RadioButtonGroup, TextArea } from '@carbon/react';
import { showSnackbar, useConfig } from '@openmrs/esm-framework';
import type { ReferralFulfillmentConfig } from './config-schema';
import {
  createReferralOut,
  fetchReferralDestinations,
  fetchReferralOutOrderables,
  type ReferralDestination,
  type ReferralOutOrderable,
} from './create-referral-out';

interface NewReferralOutModalProps {
  open: boolean;
  patientUuid: string;
  visitUuid: string;
  onClose: () => void;
  /** Called after the referral out is saved, so the list can reload. */
  onCreated: () => void;
}

/**
 * Raises a referral out (e.g. a back-referral to a PHC): pick what the patient is referred for,
 * the facility they are referred to, the priority and instructions for that facility.
 */
const NewReferralOutModal: React.FC<NewReferralOutModalProps> = ({
  open,
  patientUuid,
  visitUuid,
  onClose,
  onCreated,
}) => {
  const { t } = useTranslation();
  const config = useConfig<ReferralFulfillmentConfig>();

  const [orderables, setOrderables] = useState<ReferralOutOrderable[] | null>(null);
  const [orderablesError, setOrderablesError] = useState<string | null>(null);
  const [referredFor, setReferredFor] = useState<ReferralOutOrderable | null>(null);
  const [destinations, setDestinations] = useState<ReferralDestination[] | null>(null);
  const [referredTo, setReferredTo] = useState<ReferralDestination | null>(null);
  const [urgency, setUrgency] = useState<'ROUTINE' | 'STAT'>('ROUTINE');
  const [instructions, setInstructions] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setReferredFor(null);
    setReferredTo(null);
    setUrgency('ROUTINE');
    setInstructions('');
    fetchReferralOutOrderables(config.referralOutOrderablesConceptSetUuid)
      .then((members) => {
        setOrderables(members);
        // a single option needs no choosing
        if (members.length === 1) setReferredFor(members[0]);
      })
      .catch((e) => setOrderablesError(e?.message ?? String(e)));
    fetchReferralDestinations(config.referralDestinationLocationTag)
      .then(setDestinations)
      .catch((e) => setOrderablesError(e?.message ?? String(e)));
  }, [open, config.referralOutOrderablesConceptSetUuid, config.referralDestinationLocationTag]);

  const submit = async () => {
    if (!referredFor || !referredTo) return;
    setSubmitting(true);
    try {
      const { orderNumber, referenceNumber } = await createReferralOut(
        {
          patientUuid,
          visitUuid,
          conceptUuid: referredFor.uuid,
          destinationLocationUuid: referredTo.uuid,
          urgency,
          instructions,
        },
        config,
      );
      showSnackbar({
        kind: 'success',
        isLowContrast: true,
        title: t('referralOutCreated', 'Referral out created'),
        subtitle: t('referralOutCreatedSubtitle', '{{orderNumber}} ({{referenceNumber}}) sent to {{referredTo}}', {
          orderNumber,
          referenceNumber,
          referredTo: referredTo.display,
        }),
      });
      onCreated();
      onClose();
    } catch (e: any) {
      showSnackbar({
        kind: 'error',
        title: t('referralOutFailed', 'Could not create the referral out'),
        subtitle: e?.responseBody?.error?.message ?? e?.message ?? String(e),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      modalHeading={t('newReferralOutHeading', 'New referral out')}
      primaryButtonText={
        submitting ? (t('creating', 'Creating…') as string) : (t('createReferralOut', 'Create referral') as string)
      }
      secondaryButtonText={t('cancel', 'Cancel') as string}
      primaryButtonDisabled={!referredFor || !referredTo || submitting}
      onRequestClose={() => !submitting && onClose()}
      onRequestSubmit={() => void submit()}
    >
      <p style={{ marginBottom: '1rem' }}>
        {t(
          'newReferralOutDescription',
          'Refer the patient onward (e.g. back to a primary health care facility). The referral is sent to the receiving facility.',
        )}
      </p>
      {orderablesError && (
        <InlineNotification
          kind="error"
          lowContrast
          hideCloseButton
          title={t('referralOutOrderablesError', 'Could not load referral options')}
          subtitle={orderablesError}
        />
      )}
      {/* With a single referral option it is selected automatically and the choice is not shown;
          the dropdown appears once the orderables set offers more than one service. */}
      {(orderables?.length ?? 0) > 1 && (
        <div style={{ marginBottom: '1rem' }}>
          <Dropdown
            id="referral-out-referred-for"
            titleText={t('referredFor', 'Referred for') as string}
            label={t('selectReferral', 'Select a referral') as string}
            items={orderables ?? []}
            itemToString={(item: ReferralOutOrderable | null) => item?.display ?? ''}
            selectedItem={referredFor}
            onChange={({ selectedItem }: { selectedItem: ReferralOutOrderable | null }) => setReferredFor(selectedItem)}
          />
        </div>
      )}
      <div>
        <Dropdown
          id="referral-out-referred-to"
          titleText={t('referredTo', 'Referred to') as string}
          label={t('selectFacility', 'Select a facility') as string}
          items={destinations ?? []}
          itemToString={(item: ReferralDestination | null) => item?.display ?? ''}
          selectedItem={referredTo}
          disabled={!destinations}
          onChange={({ selectedItem }: { selectedItem: ReferralDestination | null }) => setReferredTo(selectedItem)}
        />
      </div>
      <div style={{ marginTop: '1rem' }}>
        <RadioButtonGroup
          legendText={t('urgency', 'Priority') as string}
          name="referral-out-urgency"
          valueSelected={urgency}
          onChange={(value: 'ROUTINE' | 'STAT') => setUrgency(value)}
        >
          <RadioButton id="referral-out-routine" labelText={t('routine', 'Routine') as string} value="ROUTINE" />
          <RadioButton id="referral-out-stat" labelText={t('stat', 'Urgent') as string} value="STAT" />
        </RadioButtonGroup>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <TextArea
          id="referral-out-instructions"
          labelText={t('referralOutInstructions', 'Instructions for the receiving facility (optional)') as string}
          value={instructions}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInstructions(e.target.value)}
          rows={3}
          maxCount={500}
          enableCounter
        />
      </div>
    </Modal>
  );
};

export default NewReferralOutModal;
