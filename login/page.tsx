'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function Login(){ const [email,setEmail]=useState(''); const [password,setPassword]=useState('');
  const login=async()=>{ const { data, error } = await supabase.auth.signInWithPassword({ email, password }); if(error) return alert(error.message); localStorage.setItem('user', JSON.stringify(data.user)); window.location.href = '/dashboard' }
  return (<div className='p-6 max-w-md mx-auto'><h1 className='text-2xl font-bold mb-4'>Login</h1><input className='border p-2 w-full mb-3' placeholder='Email' onChange={e=>setEmail(e.target.value)} /><input className='border p-2 w-full mb-3' type='password' placeholder='Password' onChange={e=>setPassword(e.target.value)} /><button onClick={login} className='btn-primary w-full'>Login</button></div>)
}
