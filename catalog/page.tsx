'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function Catalog(){
  const [products,setProducts]=useState([]); const [q,setQ]=useState('');
  useEffect(()=>{ load() },[]);
  async function load(){ const { data } = await supabase.from('products').select('*'); setProducts(data||[]) }
  const filtered = products.filter(p=>p.name.toLowerCase().includes(q.toLowerCase()));
  return (<div className='p-6 max-w-6xl mx-auto'><h1 className='text-2xl font-bold mb-4'>Product Catalog</h1><input className='border p-2 w-full mb-4' placeholder='Search products...' value={q} onChange={e=>setQ(e.target.value)} /><div className='grid md:grid-cols-3 gap-4'>{filtered.map(p=>(<div key={p.id} className='card'><h3 className='font-semibold'>{p.name}</h3><p className='text-sm text-gray-600'>{p.description}</p><p className='mt-2 font-semibold'>₹ {p.price}</p></div>))}</div></div>)
}
