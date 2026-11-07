import React, { useEffect, useMemo, useState } from 'react'
import { Search, ShoppingBag, Menu, X, Heart, ChevronDown, ArrowRight, Plus, Minus, Instagram, Facebook, Youtube, SlidersHorizontal, CheckCircle2 } from 'lucide-react'
import { products, collections } from './data'

const money = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

function Header({ onCart, cartCount, onSearch, onNavigate, onWishlist, wishlistCount }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  return <header className="site-header">
    <div className="topline">COMPLIMENTARY SHIPPING ON ORDERS ABOVE ₹5,000</div>
    <div className="nav-wrap">
      <button className="icon-btn mobile-menu" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">{mobileOpen ? <X/> : <Menu/>}</button>
      <a className="wordmark" href="#home" onClick={() => onNavigate('Home')}>LEO<span>®</span></a>
      <nav className={mobileOpen ? 'main-nav open' : 'main-nav'}>
        {['Shop All', 'Collections', 'Jewellery', "Women's Apparel", 'About', 'Contact'].map(n =>
          <a key={n} href={n === 'Collections' ? '#collections' : n === 'About' ? '#about' : n === 'Contact' ? '#contact' : '#shop'}
             onClick={() => { onNavigate(n); setMobileOpen(false) }}>{n}</a>)}
      </nav>
      <div className="nav-actions">
        <button className="icon-btn" onClick={onSearch} aria-label="Search"><Search/></button>
        <button className="icon-btn wishlist-nav-btn" onClick={onWishlist} aria-label={`Wishlist, ${wishlistCount} saved items`}><Heart/><span>{wishlistCount}</span></button>
        <button className="icon-btn bag-btn" onClick={onCart} aria-label="Shopping bag"><ShoppingBag/><span>{cartCount}</span></button>
      </div>
    </div>
  </header>
}

function ProductCard({ product, onAdd, onQuickView }) {
  const [liked, setLiked] = useState(() => {
    try { return JSON.parse(localStorage.getItem('leo-wishlist') || '[]').some(item => item.id === product.id) } catch { return false }
  })
  const toggleLike = e => {
    e.stopPropagation()
    let items = []
    try { items = JSON.parse(localStorage.getItem('leo-wishlist') || '[]') } catch { items = [] }
    const exists = items.some(item => item.id === product.id)
    items = exists ? items.filter(item => item.id !== product.id) : [...items, product]
    localStorage.setItem('leo-wishlist', JSON.stringify(items))
    setLiked(!exists)
    window.dispatchEvent(new CustomEvent('leo-wishlist-updated', { detail: { items, message: exists ? 'Removed from your wishlist' : 'Added to your wishlist' } }))
  }
  return <article className="product-card">
    <div className="product-image-wrap" onClick={() => onQuickView(product)}>
      <img src={product.image} alt={product.name} loading="lazy"/>
      {product.tag && <span className="product-tag">{product.tag}</span>}
      <button className={`heart-float ${liked ? 'liked' : ''}`} onClick={toggleLike} aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}><Heart size={17} fill={liked ? 'currentColor' : 'none'}/></button>
      <button className="quick-add" onClick={e => { e.stopPropagation(); onAdd(product) }}>Add to Bag <Plus size={14}/></button>
    </div>
    <div className="product-info"><div><h3>{product.name}</h3><p>{product.type} · {product.color}</p></div><strong>{money(product.price)}</strong></div>
  </article>
}

function FilterGroup({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return <div className="filter-group"><button className="filter-heading" onClick={() => setOpen(!open)}>{title}<ChevronDown size={15} className={open ? 'rotated' : ''}/></button>{open && <div className="filter-content">{children}</div>}</div>
}

function Shop({ category, setCategory, search, setSearch, onAdd, onQuickView, mode='shop', collectionName='', onBack }) {
  const [sort, setSort] = useState('featured')
  const [price, setPrice] = useState('all')
  const [colors, setColors] = useState([])
  const [types, setTypes] = useState([])
  const [sizes, setSizes] = useState([])
  const [filterOpen, setFilterOpen] = useState(false)
  const apparel = category === "Women's Apparel" || mode === 'apparel'
  const collection = mode === 'collection'
  const categoryOptions = collection ? ['Jewellery', "Women's Apparel"] : ['Jewellery', "Women's Apparel"]
  const filtered = useMemo(() => {
    let list = products.filter(p => {
      const categoryOk = category === 'All' || p.category === category
      const searchOk = p.name.toLowerCase().includes(search.toLowerCase()) || p.type.toLowerCase().includes(search.toLowerCase())
      const priceOk = price === 'all' || (price === 'under1000' && p.price < 1000) || (price === '1000to2500' && p.price >= 1000 && p.price <= 2500) || (price === '2500to5000' && p.price > 2500 && p.price <= 5000) || (price === 'over5000' && p.price > 5000)
      const colourOk = !colors.length || colors.includes(p.color)
      const typeOk = !types.length || (collection ? (types.includes('Jewellery') && p.category==='Jewellery') || (types.includes("Women's Apparel") && p.category==="Women's Apparel") : types.includes(p.type))
      const sizeOk = p.category !== "Women's Apparel" || !sizes.length || sizes.some(x => (p.sizes || ['XS','S','M','L','XL']).includes(x))
      const collectionOk = !collection || !collectionName || p.collection === collectionName || (collectionName === 'Everyday Style' && p.price < 5000) || (collectionName === 'Modern Minimalism' && ['Rings','Necklaces','Tops'].includes(p.type)) || (collectionName === 'Evening Elegance' && ['Dresses','Earrings'].includes(p.type)) || (collectionName === 'Statement Style' && ['Bracelets','Earrings','Rings'].includes(p.type))
      return categoryOk && searchOk && priceOk && colourOk && typeOk && sizeOk && collectionOk
    })
    if (sort === 'low') list.sort((a,b) => a.price-b.price)
    if (sort === 'high') list.sort((a,b) => b.price-a.price)
    return list
  }, [category, search, price, colors, types, sizes, sort, collection, collectionName])
  const toggle = (value, setter) => setter(old => old.includes(value) ? old.filter(x=>x!==value) : [...old,value])
  const filters = <>
    {mode === 'shop' && <FilterGroup title="Category">{['All',...categoryOptions].map(c=><label className="check-row" key={c}><input type="radio" checked={category===c} onChange={()=>setCategory(c)}/>{c==='All'?'All Products':c}</label>)}</FilterGroup>}
    {(mode === 'jewellery' || mode === 'apparel' || collection) && <FilterGroup title={collection?'Product Type':apparel?'Clothing Type':'Jewellery Type'}>{(collection?['Jewellery',"Women's Apparel"]:apparel?['Tops','Shirts','Dresses','Bottoms','Co-ord Sets']:['Earrings','Necklaces','Rings','Bracelets']).map(t=><label className="check-row" key={t}><input type="checkbox" checked={types.includes(t)} onChange={()=>toggle(t,setTypes)}/>{t}</label>)}</FilterGroup>}
    {apparel || (collection && types.includes("Women's Apparel")) ? <FilterGroup title="Size"><div className="size-options">{['XS','S','M','L','XL'].map(x=><button className={sizes.includes(x)?'size-chip selected':'size-chip'} onClick={()=>toggle(x,setSizes)} key={x}>{x}</button>)}</div></FilterGroup> : null}
    <FilterGroup title="Price"><select value={price} onChange={e=>setPrice(e.target.value)}><option value="all">All prices</option><option value="under1000">Under ₹1,000</option><option value="1000to2500">₹1,000 – ₹2,500</option><option value="2500to5000">₹2,500 – ₹5,000</option><option value="over5000">Above ₹5,000</option></select></FilterGroup>
    <FilterGroup title="Colour"><div className="color-options">{['Gold','Black','Beige','White'].map(c=><button key={c} title={c} className={`color-chip ${c.toLowerCase()} ${colors.includes(c)?'selected':''}`} onClick={()=>toggle(c,setColors)}/>)}</div><div className="small-muted">{colors.length?colors.join(', '):'Choose a colour'}</div></FilterGroup>
  </>
  const title = collection ? collectionName : mode==='jewellery'?'Jewellery':mode==='apparel'?"Women's Apparel":category==='All'?'Shop All':category
  return <section id="shop" className="shop-section section-pad">
    <div className="shop-banner"><div><span className="eyebrow">THE LEO EDIT</span><h1>{title}</h1><p>{collection?'Curated styles for every mood, moment and you.':'Discover our curated selection of jewellery and apparel.'}</p></div></div>
    <div className="shop-toolbar"><div><span className="eyebrow">CURATED FOR YOU</span><h2>{collection?collectionName:'Considered essentials'}</h2><p>{filtered.length} Products</p></div><div className="toolbar-controls"><button className="outline-btn mobile-filter" onClick={()=>setFilterOpen(!filterOpen)}><SlidersHorizontal size={15}/> Filter</button><label className="sort-label">Sort by <select value={sort} onChange={e=>setSort(e.target.value)}><option value="featured">Recommended</option><option value="low">Price: Low to High</option><option value="high">Price: High to Low</option></select></label></div></div>
    <div className="shop-layout"><aside className={`filters ${filterOpen?'filters-open':''}`}><div className="filter-top"><b>Filter</b><button onClick={()=>{setCategory(mode==='shop'?'All':category);setPrice('all');setColors([]);setTypes([]);setSizes([]);setSearch('')}}>Clear All</button></div>{filters}</aside>
      <div className="product-grid">{filtered.length?filtered.map(p=><ProductCard key={p.id} product={p} onAdd={onAdd} onQuickView={onQuickView}/>):<div className="empty-state">No pieces match those filters. Try clearing a filter.</div>}</div>
    </div>
  </section>
}

const collectionThemes = [
  {title:'Everyday Style',subtitle:'Effortless pieces for every day.',image:'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=85'},
  {title:'Modern Minimalism',subtitle:'Clean lines. Quiet luxury.',image:'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=85'},
  {title:'Evening Elegance',subtitle:'A little more extraordinary.',image:'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=900&q=85'},
  {title:'Statement Style',subtitle:'Pieces that speak for you.',image:'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=85'}
]
function CollectionsLanding({onSelect,onAdd,onProduct}) {
 return <main className="collection-landing">
  <section className="collection-hero"><div><h1>Collections</h1><p>Curated styles for every mood, moment and you.</p><button className="outline-btn" onClick={()=>document.getElementById('collection-themes')?.scrollIntoView({behavior:'smooth'})}>Explore Our Collections <ArrowRight size={14}/></button></div></section>
  <section id="collection-themes" className="collection-theme-grid">{collectionThemes.map(c=><button className="collection-theme" key={c.title} onClick={()=>onSelect(c.title)}><img src={c.image} alt={c.title}/><span>{c.title}<small>Explore →</small></span></button>)}</section>
  <div className="collection-no-filter-note">Explore a visual edit of pieces chosen to complement your style.</div>
  <section className="collection-featured"><h2>Curated for every moment</h2><p>Discover the pieces that make every look your own.</p><div className="product-grid home-products">{products.slice(0,10).map(p=><ProductCard key={p.id} product={p} onAdd={onAdd} onQuickView={onProduct}/>)}</div></section>
  <section className="collection-newsletter"><div><h2>Be the First to Know</h2><p>Get exclusive updates, new arrivals and special offers.</p><form onSubmit={e=>{e.preventDefault();alert('Thank you for subscribing!')}}><input type="email" placeholder="Your email address" required/><button>Subscribe</button></form></div></section>
 </main>
}
function ProductDetails({product,onAdd,onBuy,onBack}) {
 const [active,setActive]=useState(0),[size,setSize]=useState('M'),[color,setColor]=useState(product.color||'Gold')
 const [liked,setLiked]=useState(() => { try { return JSON.parse(localStorage.getItem('leo-wishlist') || '[]').some(item => item.id === product.id) } catch { return false } })
 const toggleDetailWishlist = () => { let items=[]; try { items=JSON.parse(localStorage.getItem('leo-wishlist') || '[]') } catch {} const exists=items.some(item=>item.id===product.id); items=exists?items.filter(item=>item.id!==product.id):[...items,product]; localStorage.setItem('leo-wishlist',JSON.stringify(items)); setLiked(!exists); window.dispatchEvent(new CustomEvent('leo-wishlist-updated',{detail:{items,message:exists?'Removed from your wishlist':'Added to your wishlist'}})) }
 const gallery=[product.image,'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=85','https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=85','https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=85']
 return <main className="product-detail-page section-pad"><div className="breadcrumbs"><button onClick={onBack}>Home</button> › <button onClick={onBack}>Shop All</button> › {product.name}</div><div className="product-detail-layout"><div className="product-gallery"><div className="gallery-thumbs">{gallery.map((img,i)=><button className={active===i?'active':''} key={img+i} onClick={()=>setActive(i)}><img src={img} alt={`${product.name} view ${i+1}`}/></button>)}</div><div className="gallery-main"><img src={gallery[active]} alt={product.name}/><button className={`detail-heart ${liked ? 'liked' : ''}`} onClick={toggleDetailWishlist} aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}><Heart size={19} fill={liked ? 'currentColor' : 'none'}/></button></div></div><div className="product-detail-info"><h1>{product.name}</h1><strong className="detail-price">{money(product.price)}</strong><div className="detail-rating">★★★★★ <span>4.8 (124 reviews)</span></div><p className="detail-description">A sculptural statement, designed for everyday elegance. Thoughtfully selected for timeless style and effortless versatility.</p><h4>Colour: {color}</h4><div className="detail-colors"><button onClick={()=>setColor('Gold')} className={`gold ${color==='Gold'?'selected':''}`} aria-label="Gold colour"/><button onClick={()=>setColor('Beige')} className={`beige ${color==='Beige'?'selected':''}`} aria-label="Beige colour"/></div>{(product.category==="Women's Apparel")&&<><h4>Size: <a href="#size-guide">Size Guide</a></h4><div className="detail-sizes">{['S','M','L','XL'].map(x=><button className={size===x?'selected':''} onClick={()=>setSize(x)} key={x}>{x}</button>)}</div></>}<button className="dark-btn full detail-add" onClick={()=>onAdd({...product,color,size})}>Add to Bag <ShoppingBag size={16}/></button><button className="outline-btn full" onClick={()=>onBuy({...product,color,size})}>♧ &nbsp; Buy Now</button><div className="service-icons"><span>♢<small>Premium<br/>Quality</small></span><span>↻<small>Easy<br/>Returns</small></span><span>♧<small>Secure<br/>Payment</small></span></div><div className="detail-accordions"><details><summary>Product Details</summary><p>{product.type} · {product.category}. Designed with considered details for everyday wear.</p></details><details><summary>Shipping & Returns</summary><p>Complimentary shipping on eligible orders. Easy returns within the applicable return window.</p></details><details><summary>Care Instructions</summary><p>Store carefully and keep away from moisture, perfumes and harsh chemicals.</p></details></div></div></div><section className="you-may-like"><h2>You Might Also Like</h2><div className="product-grid home-products">{products.filter(p=>p.id!==product.id).slice(0,4).map(p=><ProductCard key={p.id} product={p} onAdd={onAdd} onQuickView={()=>{}}/>)}</div></section></main>
}

function CartDrawer({ open, onClose, cart, updateQty, onCheckout }) {
  const subtotal = cart.reduce((s,i) => s + i.price*i.qty, 0)
  return <><div className={`scrim ${open ? 'visible' : ''}`} onClick={onClose}/><aside className={`cart-drawer ${open ? 'drawer-open' : ''}`}><div className="drawer-head"><div><span className="eyebrow">YOUR SELECTION</span><h2>Your Bag ({cart.reduce((s,i)=>s+i.qty,0)})</h2></div><button className="icon-btn" onClick={onClose}><X/></button></div>
    <div className="cart-items">{cart.length ? cart.map(i => <div className="cart-item" key={i.id}><img src={i.image} alt={i.name}/><div className="cart-item-info"><h3>{i.name}</h3><p>{money(i.price)}</p><div className="qty-control"><button onClick={() => updateQty(i.id, -1)}><Minus size={13}/></button><span>{i.qty}</span><button onClick={() => updateQty(i.id, 1)}><Plus size={13}/></button></div></div><strong>{money(i.price*i.qty)}</strong></div>) : <div className="empty-cart"><ShoppingBag size={30}/><h3>Your bag is waiting</h3><p>Discover something beautiful.</p><button className="dark-btn" onClick={onClose}>Continue Shopping</button></div>}</div>
    {cart.length > 0 && <div className="drawer-bottom"><div className="subtotal"><span>Subtotal</span><strong>{money(subtotal)}</strong></div><p>Shipping and taxes calculated at checkout.</p><button className="dark-btn full" onClick={onCheckout}>Proceed to Checkout <ArrowRight size={16}/></button></div>}
  </aside></>
}

function Checkout({ cart, onBack, onComplete }) {
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', phone:'', address:'', city:'', state:'', pin:'', payment:'cod' })
  const [errors, setErrors] = useState({})
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0)
  const set = e => setForm({...form,[e.target.name]:e.target.value})
  const submit = e => {
    e.preventDefault()
    const required = ['firstName','lastName','email','phone','address','city','state','pin']
    const next = {}
    required.forEach(k => { if (!form[k].trim()) next[k] = 'Required' })
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email'
    if (form.pin && !/^\d{6}$/.test(form.pin)) next.pin = 'Enter a 6-digit PIN'
    setErrors(next)
    if (!Object.keys(next).length) onComplete(form)
  }
  const field = (name,label,type='text') => <label className="form-field">{label}<input name={name} type={type} value={form[name]} onChange={set} className={errors[name]?'invalid':''}/>{errors[name] && <small>{errors[name]}</small>}</label>
  return <section className="checkout-page section-pad"><button className="text-back" onClick={onBack}>← Back to bag</button><span className="eyebrow">A FEW MORE DETAILS</span><h1>Checkout</h1><div className="checkout-layout"><form className="checkout-form" onSubmit={submit}><h2>Contact information</h2><div className="form-grid">{field('firstName','First name')}{field('lastName','Last name')}{field('email','Email address','email')}{field('phone','Phone number','tel')}</div><h2>Delivery address</h2><div className="form-grid">{field('address','Street address')}{field('city','City')}{field('state','State')}{field('pin','PIN code')}</div><h2>Payment method</h2><label className="payment-option"><input type="radio" name="payment" value="cod" checked={form.payment==='cod'} onChange={set}/> Cash on Delivery <span>Pay when your order arrives</span></label><label className="payment-option"><input type="radio" name="payment" value="online-demo" checked={form.payment==='online-demo'} onChange={set}/> Online payment <span>Demo option — no payment is collected</span></label><button className="dark-btn full submit-order" type="submit">Place Demo Order <ArrowRight size={16}/></button><p className="secure-note">This demo checkout does not process real payments.</p></form><div className="order-summary"><h2>Order summary</h2>{cart.map(i=><div className="summary-item" key={i.id}><img src={i.image} alt={i.name}/><div><b>{i.name}</b><p>Qty: {i.qty}</p></div><strong>{money(i.price*i.qty)}</strong></div>)}<div className="summary-line"><span>Subtotal</span><b>{money(total)}</b></div><div className="summary-line"><span>Shipping</span><b>{total >= 5000 ? 'Complimentary' : '₹150'}</b></div><div className="summary-line total-line"><span>Total</span><b>{money(total + (total >= 5000 ? 0 : 150))}</b></div></div></div></section>
}

function App() {
  const [category, setCategory] = useState('All')
  const [cart, setCart] = useState(() => { try { return JSON.parse(localStorage.getItem('leo-cart') || '[]') } catch { return [] } })
  const [cartOpen, setCartOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [quick, setQuick] = useState(null)
  const [page, setPage] = useState('home')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedCollection, setSelectedCollection] = useState('')
  const [order, setOrder] = useState(null)
  const [wishlist, setWishlist] = useState(() => { try { return JSON.parse(localStorage.getItem('leo-wishlist') || '[]') } catch { return [] } })
  const [wishlistToast, setWishlistToast] = useState('')
  useEffect(() => localStorage.setItem('leo-cart', JSON.stringify(cart)), [cart])
  useEffect(() => {
    const handleWishlist = event => { setWishlist(event.detail.items || []); setWishlistToast(event.detail.message || 'Wishlist updated') }
    window.addEventListener('leo-wishlist-updated', handleWishlist)
    return () => window.removeEventListener('leo-wishlist-updated', handleWishlist)
  }, [])
  useEffect(() => { if (!wishlistToast) return; const timer = setTimeout(() => setWishlistToast(''), 2600); return () => clearTimeout(timer) }, [wishlistToast])
  const add = p => { setCart(old => { const found = old.find(i=>i.id===p.id); return found ? old.map(i=>i.id===p.id?{...i,qty:i.qty+1}:i) : [...old,{...p,qty:1}] }); setCartOpen(true) }
  const updateQty = (id, delta) => setCart(old => old.map(i=>i.id===id?{...i,qty:i.qty+delta}:i).filter(i=>i.qty>0))
  const navigate = n => { if (n==='Jewellery' || n==="Women's Apparel") { setCategory(n); setPage(n==='Jewellery'?'jewellery':'apparel');window.scrollTo(0,0) } else if (n==='Shop All') { setCategory('All');setPage('shop');window.scrollTo(0,0) } else if (n==='Collections') { setPage('collections');window.scrollTo(0,0) } else if (n==='About') { setPage('home');setTimeout(()=>document.getElementById('about')?.scrollIntoView({behavior:'smooth'}),50) } else if (n==='Contact') { setPage('home');setTimeout(()=>document.getElementById('contact')?.scrollIntoView({behavior:'smooth'}),50) } else {setPage('home');window.scrollTo({top:0,behavior:'smooth'})} }
  const checkout = () => { setCartOpen(false);setPage('checkout');window.scrollTo(0,0) }
  const complete = details => { setOrder({details, number:'LEO-'+Math.floor(100000+Math.random()*900000)});setCart([]);setPage('success');window.scrollTo(0,0) }
  return <><Header onCart={()=>setCartOpen(true)} cartCount={cart.reduce((s,i)=>s+i.qty,0)} onSearch={()=>setSearchOpen(!searchOpen)} onNavigate={navigate} wishlistCount={wishlist.length} onWishlist={()=>{setPage('wishlist');window.scrollTo(0,0)}}/>
    {searchOpen && <div className="search-bar"><Search size={18}/><input autoFocus placeholder="Search pieces, jewellery, apparel..." value={search} onChange={e=>{setSearch(e.target.value);setPage('shop')}}/><button onClick={()=>{setSearch('');setSearchOpen(false)}}><X size={18}/></button></div>}
    {page==='home' && <>
      <main>
        <section className="hero"><img src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=2200&q=90" alt="Elegant fashion editorial"/><div className="hero-shade"/><div className="hero-copy"><span className="eyebrow light">THE ART OF EVERYDAY ELEGANCE</span><h1>Elegance<br/>in Every Detail</h1><p>Timeless fashion. Effortless you.</p><button className="cream-btn" onClick={()=>{setCategory('All');setPage('shop');window.scrollTo(0,0)}}>Shop The Look <ArrowRight size={15}/></button></div><div className="hero-index">01 / 03</div></section>
        <section className="explore section-pad"><div className="section-heading"><span className="eyebrow">A WORLD OF LEO</span><h2>Explore Our World</h2><p>Thoughtfully chosen. Beautifully made.</p></div><div className="category-tiles"><button onClick={()=>navigate('Jewellery')}><img src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=85"/><span>Jewellery <ArrowRight size={14}/></span></button><button onClick={()=>navigate("Women's Apparel")}><img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85"/><span>Women's Apparel <ArrowRight size={14}/></span></button><button onClick={()=>navigate('Shop All')}><img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=85"/><span>Discover All <ArrowRight size={14}/></span></button></div></section>
        <section className="arrivals section-pad"><div className="section-heading side-heading"><div><span className="eyebrow">JUST LANDED</span><h2>New Arrivals</h2><p>Fresh perspectives on timeless style.</p></div><button className="text-link" onClick={()=>{setCategory('All');setPage('shop');window.scrollTo(0,0)}}>Shop All <ArrowRight size={16}/></button></div><div className="product-grid home-products">{products.slice(0,4).map(p=><ProductCard key={p.id} product={p} onAdd={add} onQuickView={p=>{setSelectedProduct(p);setPage('product');window.scrollTo(0,0)}}/>)}</div></section>
        <section id="collections" className="collections section-pad"><div className="section-heading"><span className="eyebrow">STORIES IN STYLE</span><h2>Our Collections</h2><p>Curated for every mood, moment and you.</p></div><div className="collection-grid">{collections.map((c,i)=><article className={`collection-card collection-${i}`} key={c.title}><img src={c.image} alt={c.title}/><div><span className="eyebrow light">THE LEO COLLECTION</span><h3>{c.title}</h3><p>{c.subtitle}</p><button className="cream-outline" onClick={()=>{setSelectedCollection(c.title);setCategory('All');setPage('individual-collection');window.scrollTo(0,0)}}>Explore Collection <ArrowRight size={14}/></button></div></article>)}</div></section>
        <section id="about" className="about-section"><div className="about-image"><img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1300&q=90" alt="LEO brand editorial"/></div><div className="about-copy"><span className="eyebrow">THE LEO PHILOSOPHY</span><h2>Our Story</h2><p className="about-lead">A celebration of elegance, craftsmanship and timeless style.</p><p>At LEO, we believe fashion is more than what you wear — it is how you express yourself. We bring together considered design, thoughtful details and enduring silhouettes to create pieces that feel distinctly yours.</p><button className="outline-btn" onClick={()=>document.getElementById('contact')?.scrollIntoView({behavior:'smooth'})}>Discover Our Journey <ArrowRight size={14}/></button><div className="stats"><div><b>10+</b><span>Years of style</span></div><div><b>50K+</b><span>Happy customers</span></div><div><b>25+</b><span>Countries</span></div></div></div></section>
        <section className="club section-pad"><span className="eyebrow light">A LITTLE MORE LEO</span><h2>Join Our Exclusive Club</h2><p>Be the first to know about new arrivals and offers.</p><form onSubmit={e=>{e.preventDefault();alert('Thank you for joining the LEO list!')}}><input type="email" placeholder="Your email address" required/><button aria-label="Subscribe"><ArrowRight/></button></form></section>
        <section id="contact" className="contact-section section-pad"><div><span className="eyebrow">WE WOULD LOVE TO HEAR FROM YOU</span><h2>Get in Touch</h2><p>Our team is here to help with every detail.</p><p className="contact-detail">✉ &nbsp; hello@leo.com<br/>☎ &nbsp; +91 98765 43210<br/>⌖ &nbsp; Mumbai, India</p></div><form onSubmit={e=>{e.preventDefault();alert('Thank you. Our team will be in touch.')}}><label>Your name<input required placeholder="Full name"/></label><label>Email address<input type="email" required placeholder="Email address"/></label><label>Message<textarea required rows="4" placeholder="How can we help?"/></label><button className="dark-btn">Send Message <ArrowRight size={15}/></button></form></section>
      </main>
      <Footer/>
    </>}
    {page==='shop' && <><Shop category={category} setCategory={setCategory} search={search} setSearch={setSearch} onAdd={add} onQuickView={p=>{setSelectedProduct(p);setPage('product');window.scrollTo(0,0)}}/><Footer/></>}
    {page==='jewellery' && <><Shop mode="jewellery" category="Jewellery" setCategory={setCategory} search={search} setSearch={setSearch} onAdd={add} onQuickView={p=>{setSelectedProduct(p);setPage('product');window.scrollTo(0,0)}}/><Footer/></>}
    {page==='apparel' && <><Shop mode="apparel" category="Women's Apparel" setCategory={setCategory} search={search} setSearch={setSearch} onAdd={add} onQuickView={p=>{setSelectedProduct(p);setPage('product');window.scrollTo(0,0)}}/><Footer/></>}
    {page==='collections' && <><CollectionsLanding onAdd={add} onProduct={p=>{setSelectedProduct(p);setPage('product');window.scrollTo(0,0)}} onSelect={name=>{setSelectedCollection(name);setCategory('All');setPage('individual-collection');window.scrollTo(0,0)}}/><Footer/></>}
    {page==='individual-collection' && <><Shop mode="collection" collectionName={selectedCollection} category="All" setCategory={setCategory} search={search} setSearch={setSearch} onAdd={add} onQuickView={p=>{setSelectedProduct(p);setPage('product');window.scrollTo(0,0)}}/><Footer/></>}
    {page==='product' && selectedProduct && <><ProductDetails product={selectedProduct} onAdd={add} onBuy={p=>{setCart(old=>{const found=old.find(i=>i.id===p.id);return found?old.map(i=>i.id===p.id?{...i,qty:i.qty+1}:i):[...old,{...p,qty:1}]});setPage('checkout');setCartOpen(false);window.scrollTo(0,0)}} onBack={()=>{setPage('shop');window.scrollTo(0,0)}}/><Footer/></>}
    {page==='wishlist' && <><main className="wishlist-page section-pad"><div className="section-heading"><span className="eyebrow">YOUR SAVED PIECES</span><h2>My Wishlist</h2><p>{wishlist.length} {wishlist.length===1?'piece':'pieces'} saved</p></div>{wishlist.length ? <div className="product-grid wishlist-grid">{wishlist.map(p=><ProductCard key={p.id} product={p} onAdd={add} onQuickView={p=>{setSelectedProduct(p);setPage('product');window.scrollTo(0,0)}}/>)}</div> : <div className="wishlist-empty"><Heart size={32}/><h3>Your wishlist is empty</h3><p>Save the pieces you love and find them here.</p><button className="dark-btn" onClick={()=>{setPage('shop');setCategory('All');window.scrollTo(0,0)}}>Explore Products</button></div>}</main><Footer/></>}
    {page==='checkout' && <><Checkout cart={cart} onBack={()=>{setPage('shop');setCartOpen(true)}} onComplete={complete}/><Footer/></>}
    {page==='success' && <><section className="success-page"><CheckCircle2 size={54}/><span className="eyebrow">THANK YOU FOR CHOOSING LEO</span><h1>Your order is placed.</h1><p>Your demo order number is <b>{order?.number}</b>.</p><p>A real store would send an order confirmation to {order?.details.email}.</p><button className="dark-btn" onClick={()=>{setPage('home');window.scrollTo(0,0)}}>Continue Exploring <ArrowRight size={15}/></button></section><Footer/></>}
    {wishlistToast && <div className="wishlist-toast" role="status"><Heart size={16}/> {wishlistToast}</div>}
    <CartDrawer open={cartOpen} onClose={()=>setCartOpen(false)} cart={cart} updateQty={updateQty} onCheckout={checkout}/>

  </>
}

function Footer() {
  return <footer className="footer"><div className="footer-main"><div className="footer-brand"><a className="wordmark footer-logo" href="#home">LEO<span>®</span></a><p>Luxury, thoughtfully considered.</p><div className="socials"><a href="#instagram" aria-label="Instagram"><Instagram/></a><a href="#facebook" aria-label="Facebook"><Facebook/></a><a href="#youtube" aria-label="Youtube"><Youtube/></a></div></div><div><h4>SHOP</h4><a href="#shop">Shop All</a><a href="#shop">Jewellery</a><a href="#shop">Women's Apparel</a><a href="#collections">Collections</a></div><div><h4>CUSTOMER CARE</h4><a href="#contact">FAQs</a><a href="#contact">Shipping & Delivery</a><a href="#contact">Returns & Exchanges</a><a href="#contact">Contact Us</a></div><div><h4>ABOUT</h4><a href="#about">Our Story</a><a href="#about">Sustainability</a><a href="#about">Careers</a></div></div><div className="footer-bottom"><span>© 2026 LEO Luxury Fashion. All rights reserved.</span><div><a href="#privacy">Privacy Policy</a><a href="#terms">Terms & Conditions</a><a href="#shipping">Shipping Policy</a><a href="#returns">Returns Policy</a></div><span>Made with intention.</span></div></footer>
}

export default App