import React from 'react';
import { useTranslation } from 'react-i18next';
import { ConfigurableLink } from '@openmrs/esm-framework';

interface Props {
  basePath: string;
}

/** "Imaging results" in the patient chart's left navigation, next to Orders and Results. */
const ImagingResultsLink: React.FC<Props> = ({ basePath }) => {
  const { t } = useTranslation();
  return (
    <ConfigurableLink to={`${basePath}/Imaging results`} className="cds--side-nav__link">
      <span
        // same icon column as the sibling links
        className="cds--side-nav__icon"
        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <svg className="omrs-icon" aria-hidden="true" width={16} height={16} viewBox="0 0 16 16" style={{ fill: 'currentColor' }}>
          <use href="#omrs-icon-image-medical" />
        </svg>
      </span>
      <span className="cds--side-nav__link-text">{t('imagingResults', 'Imaging results')}</span>
    </ConfigurableLink>
  );
};

export default ImagingResultsLink;
