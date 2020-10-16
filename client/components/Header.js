import Link from 'next/link';

export default ({ currentUser }) => {
  const links = [
    !currentUser && { label: 'Sign Up', href: '/auth/signup' },
    !currentUser && { label: 'Sign In', href: '/auth/signin' },
    currentUser && { label: 'Sell Tickets', href: '/tickets/new' },
    currentUser && { label: 'My Orders', href: '/orders' },
    currentUser && { label: 'Sign Out', href: '/auth/signout' }
  ]
    .filter(linkConfig => linkConfig)
    .map(({ label, href }) => {
      return (
        <li key={href}>
          <Link href={href}>
            <a className="btn btn-block-mobile" href={href}>{label}</a>
          </Link>
        </li>
      );
    });

  return (
    <nav id="navbar">
      <Link href="/">
        <a className="btn btn-block-mobile">GitTix</a>
      </Link>
      <ul>
        {links}
      </ul>
    </nav>
  );
}