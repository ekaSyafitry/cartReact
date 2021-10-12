import './App.css';
import productList from './product.js'
import { useEffect, useState} from 'react';

function App(props) {

  const [cartItem, setCartItem] = useState([]);
  const [arrayCart, setarrayCart] = useState([]);
  const [showCart, setShowCart] = useState(false)
  const getCartFromLocalStorage = () => {
    return JSON.parse(localStorage.getItem('cart'))
  }

  useEffect(() => {
    const getCart = getCartFromLocalStorage()
    
    if(getCart){
      setarrayCart(getCart);
    }    
  }, [])

  const addToCart = async (id, event) => {
   let product = {
      id,
      qty: 1
    } 
    let cartList = []
    const getCart = getCartFromLocalStorage() 
    const isExist = checkProductExistInCart(id, getCart) 
    if(getCart) { 
      cartList = getCart
    }

    if(isExist) {
      let indexObj = 0
      indexObj = cartList.findIndex((obj => obj.id === isExist.id));
      const checkOOS = checkIsOutOfStock(id, cartList[indexObj].qty)
      if(checkOOS){
        alert('qty sudah melebihi jumlah stock')
        return
      }
      else{
        cartList[indexObj].qty += 1
      }
    } else { 
      cartList.push(product)
    }
    
    localStorage.setItem("cart", JSON.stringify(cartList)) 
    setarrayCart(cartList)
  }

  const checkIsOutOfStock = (id, count) =>{
    var found = productList.find(function (cart) {
      return cart.id === id
    });
    if(found.stock <= count){
      return true
    }
    return false

  }
  const checkProductExistInCart = (id, cart_data) => {
    if(cart_data && cart_data.length > 0) {
      return cart_data.find(cart => {
       if(cart.id === id) {
         return cart
       }
      })
    }
    return
  }
  
  const getProductFromCart = () => {
    setShowCart(true);
    const getCart = getCartFromLocalStorage() 
    let cartList = [] 
    if(getCart && getCart.length > 0) { 
      getCart.forEach(cart => { 
        productList.find(products => { 
          if(products.id === cart.id) {
            cartList.push({...products, qty:cart.qty}) 
          }
        })
        setCartItem(cartList); 
      })
    }
  }
  const updateCart = (id, event, type) =>{
    let qty = 0
    if(parseInt(event.target.value)) qty = parseInt(event.target.value)
    if (isNaN(qty)){
      qty = 0
    }  
    let cartList = [...cartItem]
    let indexObj = cartList.findIndex((obj => obj.id === id))
    if(type==='edit'){
      const isOOS = checkIsOutOfStock(id, qty)
        if(isOOS && qty > 2){
          alert('qty sudah melebihi jumlah stock')
        return
        }
        else{
          cartList[indexObj].qty = qty
        }
        
        setCartItem(cartList)
        localStorage.setItem("cart", JSON.stringify(cartList))
    }
    else if(type === 'add'){
      const isOOS = checkIsOutOfStock(id, cartList[indexObj].qty)
      if(isOOS){
        alert('qty sudah melebihi jumlah stock')
        return
      }else{
        cartList[indexObj].qty += 1
      }
      setCartItem(cartList)
      localStorage.setItem("cart", JSON.stringify(cartList))
    }
    else{
      if(cartList[indexObj].qty > 1){
        cartList[indexObj].qty -= 1
        setCartItem(cartList)
        localStorage.setItem("cart", JSON.stringify(cartList))
      }
      else if(cartList[indexObj].qty <= 1 ){
        deleteCart(id, cartList)     
      }     
    } 
  }

  const deleteCart = (idCart, cartList) => {
    if (window.confirm('Apakah kamu yakin ingin menghapus produk dari keranjang?')) {
      let deletedArray =  cartList.filter(({ id }) => id !== idCart);
      setCartItem(deletedArray)
      localStorage.setItem("cart", JSON.stringify(deletedArray))
      setarrayCart(deletedArray)   
    } else {
      return
    }
    
  }

  const updateIfNull = (e, id, list) =>{
    if (e.target.value  === '0'){
      deleteCart(id, list)
    }
    if(e.target.value.length >= 2){  
      e.target.value= e.target.value.replace(/^0+/, '')
    }
  }

  return (
    <div className="App">
      <header className="App-header">
       <h1>XZYmart</h1>
       <div className="cartIcon" onClick={getProductFromCart}><span>{arrayCart.length !== 0? arrayCart.length:"" } </span><i className="fas fa-shopping-cart"></i></div>     
      </header>
      <section>
        <h3>Produk terlaris</h3>
        <div className="row">
        {productList.map((item, i) => (
          <div className="card" key={i}>
          <img src={item.image} alt="" width="100%" />
          <div className="product-info">
            <div className="name">{item.name}</div>
            <div className="price">Rp. {item.price}</div>
            <button className="add-cart" onClick={()=>addToCart(item.id)}>Add to cart</button>
          </div>
          </div>
        ))}
        </div>
        <div className={showCart? "overlay active" : "overlay"} onClick={ () => setShowCart(false)}></div>
        <div className={showCart? 'productCartList active' : 'productCartList'}>
          <div className="title flex-center-between">
          <h3>Keranjang Saya</h3>
          <i className="fas fa-times" style={{cursor: 'pointer'}} onClick={ () => setShowCart(false)}></i>
          </div>
          
          <div className="listProductCart">
            {cartItem.length !== 0 ? (
              
              cartItem.map((item, i) => (
                <div className="itemCart" key={i}>
                  <img src={item.image} alt="" width="100%" />
                  <div className="info">
                    <div className="name">{item.name}</div>
                    <div className="price">Rp. {item.price}</div>
                    <div className="inputgroup" style={{display: 'flex', marginTop: '1rem'}}>
                      <button onClick={(e) => updateCart(item.id, e, 'decrease')}>-</button><input type="number" value={item.qty} onChange={(e) => updateCart(item.id, e, 'edit')} style={{width: `50%`}} onBlur={(e) => updateIfNull(e, item.id, cartItem)}></input> <button onClick={(e) => updateCart(item.id, e, 'add')}>+</button>
                    </div>
                    <i className="fas fa-trash" style={{marginTop: '2rem', cursor: 'pointer'}} onClick={() => deleteCart(item.id, cartItem)}></i>
                  </div>
                </div>
              ))
            ) : (
              <h4>Belum ada product</h4>
            )
           
            
          }
          
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
