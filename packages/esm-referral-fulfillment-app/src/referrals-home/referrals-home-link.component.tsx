import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfigurableLink } from '@openmrs/esm-framework';

/** "Referrals" in the home page's left navigation, next to Imaging (home/referrals). */
const ReferralsHomeLink: React.FC = () => {
  const { t } = useTranslation();
  const isActive = () => window.location.pathname.split('/').includes('referrals');
  const [active, setActive] = useState(isActive);

  useEffect(() => {
    const onRoute = () => setActive(isActive());
    window.addEventListener('single-spa:routing-event', onRoute);
    return () => window.removeEventListener('single-spa:routing-event', onRoute);
  }, []);

  return (
    <ConfigurableLink
      to={`\${openmrsSpaBase}/home/referrals`}
      className={`cds--side-nav__link${active ? ' active-left-nav-link' : ''}`}
    >
      {t('referrals', 'Referrals')}
    </ConfigurableLink>
  );
};

export default ReferralsHomeLink;
