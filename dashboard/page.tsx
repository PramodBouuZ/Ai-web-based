'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function Dashboard(){ const [enquiries,setEnquiries]=useState([])
  useEffect(()=>{ load() },[])
  async function load(){ const { data } = await supabase.from('enquiries').select('*').order('created_at',{ascending:false}).limit(50); setEnquiries(data||[]) }
  return (<div className='p-6 max-w-6xl mx-auto'><h1 className='text-2xl font-bold mb-4'>Dashboard</h1><div className='grid md:grid-cols-3 gap-4'><div className='card'>Post Enquiry</div><div className='card'>My Enquiries ({enquiries.length})</div><div className='card'>Wallet</div></div></div>)
}
