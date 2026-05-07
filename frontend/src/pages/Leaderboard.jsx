import { useEffect,useState } from 'react';import { api } from '../services/api';
export default function Leaderboard(){const [rows,setRows]=useState([]); useEffect(()=>{api.get('/leaderboard').then(r=>setRows(r.data));},[]); return <div className='card'><h2>Leaderboard</h2>{rows.map(r=><p key={r.teamNumber}>#{r.rank} Team {r.teamNumber} - ${r.totalNetWorth}</p>)}</div>;}
