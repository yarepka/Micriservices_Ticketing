import Link from 'next/link';

import Empty from '../components/Empty';

const LandingPage = ({ currentUser, tickets }) => {
  if (tickets.length <= 0) {
    return <Empty />;
  }

  const ticketList = tickets.map((ticket) => {
    return (
      <div className='ticket card'>
        <h2>{ticket.title}</h2>
        <div className='price'>
          <span>Price: </span>
          <p className='number'>${ticket.price}</p>
        </div>
        <Link href='/tickets/[ticketId]' as={`/tickets/${ticket.id}`}>
          <a class='btn btn-block'>View</a>
        </Link>
      </div>
    );
  });

  return <div className='tickets'>{ticketList}</div>;
};

// will be executed during server side rendering process
// here we will fetch some data specificaly for doing
// some initial rendering for our app
// any data we return from this function will show up
// inside of our component props

/*
  getInitialProps executed on the server:
  - Hard refresh of the page
  - Clicking link from different domain
  - Typing URL into address bar
  getInitialProps executed on the client:
  - Navigation from one page to another while in the app
*/
LandingPage.getInitialProps = async (context, client, currentUser) => {
  const { data } = await client.get('/api/tickets');

  return { tickets: data };
};

export default LandingPage;
