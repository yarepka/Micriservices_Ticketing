import Empty from '../../components/Empty';

const OrderIndex = ({ orders }) => {
  console.log(orders);
  if (orders.length <= 0) {
    return <Empty />
  }

  return <ul className="orders">
    {orders.map(order => {
      return <li className="order" key={order.id}>
        <div>
          <p>Title: {order.ticket.title}</p>
          <p>Price: {order.ticket.price}</p>
        </div>
        <div>
          Status: <span className="status">
            {order.status[0].toUpperCase() + order.status.substring(1)}
          </span>
        </div>
      </li>
    })}
  </ul>;
}

OrderIndex.getInitialProps = async (context, client) => {
  const { data } = await client.get('/api/orders');

  return { orders: data };
}

export default OrderIndex;