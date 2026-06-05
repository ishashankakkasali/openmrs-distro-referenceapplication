import React from 'react';
import { ConfigurableLink } from '@openmrs/esm-framework';

interface DashboardLinkProps {
  basePath: string;
}

const dashboardMeta = {
  path: 'Referrals',
  title: 'Referrals',
};

const ReferralsDashboardLink: React.FC<DashboardLinkProps> = ({ basePath }) => {
  return (
    <ConfigurableLink
      to={`${basePath}/${dashboardMeta.path}`}
      className="cds--side-nav__link"
    >
      <span
        // Mirror Carbon's `cds--side-nav__icon` slot used by sibling links so the
        // label aligns with the others (icons live in a 16px-wide column with
        // 0.5rem inline padding).
        className="cds--side-nav__icon"
        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <svg
          // The styleguide sprite symbol uses a 16x16 viewBox (path is M16 0H0V16H16V0Z).
          className="omrs-icon"
          aria-hidden="true"
          width={16}
          height={16}
          viewBox="0 0 16 16"
          style={{ fill: 'currentColor' }}
        >
          <use href="#omrs-icon-referral-order" />
        </svg>
      </span>
      <span className="cds--side-nav__link-text">{dashboardMeta.title}</span>
    </ConfigurableLink>
  );
};

export default ReferralsDashboardLink;
