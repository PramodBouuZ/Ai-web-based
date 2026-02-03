'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
export default function Signup(){ const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [name,setName]=useState('');
  const signup=async()=>{ const { data, error } = await supabase.auth.signUp({ email, password }, { data: { full_name: name } }); if(error) return alert(error.message); alert('Signup complete - please check email'); window.location.href='/login' }
  return (<div className='p-6 max-w-md mx-auto'><h1 className='text-2xl font-bold mb-4'>Sign Up</h1><input className='border p-2 w-full mb-3' placeholder='Full name' onChange={e=>setName(e.target.value)} /><input className='border p-2 w-full mb-3' placeholder='Email' onChange={e=>setEmail(e.target.value)} /><input className='border p-2 w-full mb-3' type='password' placeholder='Password' onChange={e=>setPassword(e.target.value)} /><button onClick={signup} className='btn-accent w-full'>Create account</button></div>)
}
