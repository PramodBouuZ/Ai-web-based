'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
export default function CreateEnquiry(){ const [title,setTitle]=useState(''); const [description,setDescription]=useState(''); const [budget,setBudget]=useState('')
  const submit=async()=>{ const user = JSON.parse(localStorage.getItem('user')||'null'); if(!user) return window.location.href='/login'; const { data, error } = await supabase.from('enquiries').insert([{ title, description, budget: Number(budget||0), posted_by: user.id }]); if(error) return alert(error.message); alert('Enquiry posted'); window.location.href='/dashboard' }
  return (<div className='p-6 max-w-2xl mx-auto'><h1 className='text-2xl font-bold mb-4'>Post Enquiry</h1><input className='border p-2 w-full mb-3' placeholder='Title' onChange={e=>setTitle(e.target.value)} /><textarea className='border p-2 w-full mb-3' placeholder='Description' onChange={e=>setDescription(e.target.value)} /><input className='border p-2 w-full mb-3' placeholder='Budget' onChange={e=>setBudget(e.target.value)} /><button onClick={submit} className='btn-primary w-full'>Submit</button></div>)
}
