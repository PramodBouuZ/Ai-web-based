'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function ProductDetail(){
  const params = useParams(); const id = params.id; const [p,setP]=useState(null);
  useEffect(()=>{ if(id) load() },[id]);
  async function load(){ const { data } = await supabase.from('products').select('*').eq('id', id).single(); setP(data) }
  if(!p) return <div className='p-6'>Loading...</div>
  return (<div className='p-6 max-w-3xl mx-auto'><h1 className='text-2xl font-bold'>{p.name}</h1><p className='text-gray-700'>{p.description}</p><p className='mt-3 font-semibold'>₹ {p.price}</p></div>)
}
