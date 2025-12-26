import { createContext, useState, useContext } from 'react';

const InventoryContext = createContext();

export const useInventory = () => useContext(InventoryContext);

export const InventoryProvider = ({ children }) => {
  const [products, setProducts] = useState([
    { 
      id: 1, 
      name: 'Cemento Holcim 50kg', 
      stock: 100, 
      cost: 180, 
      priceRetail: 230,     
      priceWholesale: 215,  
      wholesaleQty: 10      
    },
    { 
      id: 2, 
      name: 'Varilla Corrugada 3/8', 
      stock: 500, 
      cost: 120, 
      priceRetail: 160, 
      priceWholesale: 145,
      wholesaleQty: 50
    },
  ]);

  const [sales, setSales] = useState([]);

  const addProduct = (product) => {
    const newProduct = { ...product, id: Date.now() };
    setProducts([...products, newProduct]);
  };

  const updateProduct = (id, updatedData) => {
    setProducts(products.map(prod => 
      prod.id === id ? { ...prod, ...updatedData } : prod
    ));
  };

  const deleteProduct = (id) => {
    setProducts(products.filter(prod => prod.id !== id));
  };

  const addSale = (saleItems, total) => {
    const newSale = {
      id: Date.now(), 
      date: new Date(),
      items: saleItems,
      total: total,
      
    };

    setSales([newSale, ...sales]); 

    const updatedProducts = products.map(prod => {
      const itemSold = saleItems.find(item => item.id === prod.id);
      if (itemSold) {
        return { ...prod, stock: prod.stock - itemSold.quantity };
      }
      return prod;
    });

    setProducts(updatedProducts);
    
    return newSale;
  };

  return (
    <InventoryContext.Provider value={{ 
      products, 
      sales,          
      addSale,        
      addProduct, 
      updateProduct, 
      deleteProduct
    }}>
      {children}
    </InventoryContext.Provider>
  );
};