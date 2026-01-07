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
  const [sales, setSales] = useState([]); // Historial de ventas (Local por ahora)

  // 1. Cargar productos desde la Base de Datos al iniciar
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getProductsService();
      setProducts(data);
    } catch (error) {
      console.error("Error al cargar productos del servidor:", error);
    }
  };

  // 2. Agregar Producto (Conectado a BD)
  const addProduct = async (productData) => {
    try {
      const newProduct = await createProductService(productData);
      // Actualizamos el estado local agregando el nuevo producto que nos devolvió el back
      setProducts([...products, newProduct]);
      return true;
    } catch (error) {
      console.error("Error al crear producto:", error);
      alert("Error al guardar en la base de datos");
      return false;
    }
  };

  // 3. Editar Producto (Conectado a BD)
  const updateProduct = async (id, updatedData) => {
    try {
      await updateProductService(id, updatedData);
      // Actualizamos la lista local mapeando y reemplazando el modificado
      setProducts(products.map(p => (p.id === id ? { ...p, ...updatedData } : p)));
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      alert("No se pudo actualizar el producto");
    }
  };

  // 4. Eliminar Producto (Conectado a BD)
  const deleteProduct = async (id) => {
    try {
      await deleteProductService(id);
      // Filtramos el producto eliminado del estado local
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      alert("No se pudo eliminar. Verifica tu conexión.");
    }
  };

   
  const addSale = async (cart, total, customer, seller, paymentMethod) => {
    try {
        const saleData = {
            cart, 
            total, 
            customer, 
            seller, 
            paymentMethod
        };

        // 1. Enviar al Backend
        await createSaleService(saleData);

        // 2. Recargar productos (para que se actualice el stock visualmente)
        await loadProducts(); 

        // 3. (Opcional) Recargar historial de ventas si lo tienes en estado
        // const history = await getSalesHistoryService();
        // setSales(history);

        return true; // Éxito
    } catch (error) {
        console.error("Error al procesar venta:", error);
        alert("Error al registrar la venta en el servidor.");
        return false;
    }

    // Descontar stock localmente para que se vea reflejado inmediato en el POS
    // (Opcional: aquí podrías llamar a una función de updateProductService para cada item)
    const updatedProducts = products.map(prod => {
      const itemInCart = cartItems.find(item => item.id === prod.id);
      if (itemInCart) {
        return { ...prod, stock: prod.stock - itemInCart.quantity };
      }
      return prod;
    });
    setProducts(updatedProducts);
    
    return newSale; // Retornamos para imprimir ticket
  };

  return (
    <InventoryContext.Provider value={{ 
      products, 
      sales, 
      addProduct, 
      updateProduct, 
      deleteProduct, 
      addSale 
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  return useContext(InventoryContext);
};