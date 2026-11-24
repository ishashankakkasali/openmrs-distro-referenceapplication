import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfigurableLink } from '@openmrs/esm-framework';

/** "Imaging" in the home page's left navigation, next to Laboratory (home/imaging). */
const ImagingDashboardLink: React.FC = () => {
  const { t } = useTranslation();
  const isActive = () => window.location.pathname.split('/').includes('imaging');
  const [active, setActive] = useState(isActive);

  useEffect(() => {
    const onRoute = () => setActive(isActive());
    window.addEventListener('single-spa:routing-event', onRoute);
    return () => window.removeEventListener('single-spa:routing-event', onRoute);
  }, []);

  return (
    <ConfigurableLink
      to={`\${openmrsSpaBase}/home/imaging`}
      className={`cds--side-nav__link${active ? ' active-left-nav-link' : ''}`}
    >
      {t('imaging', 'Imaging')}
    </ConfigurableLink>
  );
};

export default ImagingDashboardLink;
