import { createContext, useContext, useState, useEffect } from 'react';
import { 
  getProductsService, 
  createProductService, 
  updateProductService, 
  deleteProductService 
} from '../services/productService';
import { createSaleService, getSalesHistoryService } from '../services/saleService';

const InventoryContext = createContext();

export const InventoryProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]); 

  useEffect(() => {
    loadProducts();
    loadSales(); 
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getProductsService();
      setProducts(data);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    }
  };

  const loadSales = async () => {
    try {
      const history = await getSalesHistoryService();
      setSales(history);
    } catch (error) {
      console.error("Error al cargar historial:", error);
    }
  };

  const addProduct = async (productData) => { 
      try {
        const newProduct = await createProductService(productData);
        setProducts([...products, newProduct]);
        return true;
      } catch (error) { console.error(error); return false; }
  };

  const updateProduct = async (id, updatedData) => { 
      try {
        await updateProductService(id, updatedData);
        setProducts(products.map(p => (p.id === id ? { ...p, ...updatedData } : p)));
      } catch (error) { console.error(error); }
  };

  const deleteProduct = async (id) => {  
      try {
        await deleteProductService(id);
        setProducts(products.filter(p => p.id !== id));
      } catch (error) { console.error(error); }
  };
    
  const addSale = async (cart, total, customer, seller, paymentMethod, ticketNumber) => {
    try { 
        const saleData = { cart, total, customer, seller, paymentMethod, ticketNumber };

        const response = await createSaleService(saleData); 

        await loadProducts(); 
        await loadSales(); 

        return { success: true, id: response.saleId || response.id }; 
    } catch (error) {
        console.error("Error al procesar venta:", error);
        alert("Error al registrar la venta.");
        return { success: false };
    }
  };

  return (
    <InventoryContext.Provider value={{ 
      products, 
      sales, 
      addProduct, 
      updateProduct, 
      deleteProduct, 
      addSale,
      loadSales 
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => useContext(InventoryContext);