import { Link } from 'react-router-dom';
export default function Layout({children}) {return <div className='app'><header>Wolf of Wall Street</header>{children}<nav><Link to='/dashboard'>Dashboard</Link><Link to='/marketplace'>Marketplace</Link><Link to='/leaderboard'>Leaderboard</Link></nav></div>;}
