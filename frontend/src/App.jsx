import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';import Dashboard from './pages/Dashboard';import Marketplace from './pages/Marketplace';import Leaderboard from './pages/Leaderboard';import Admin from './pages/Admin';
export default function App(){return <Layout><Routes><Route path='/' element={<LoginPage/>}/><Route path='/dashboard' element={<Dashboard/>}/><Route path='/marketplace' element={<Marketplace/>}/><Route path='/leaderboard' element={<Leaderboard/>}/><Route path='/admin' element={<Admin/>}/><Route path='*' element={<Navigate to='/'/>}/></Routes></Layout>;}
