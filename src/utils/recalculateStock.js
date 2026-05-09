import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../firebase/db';

export async function recalculateStock(itemModelId) {
  const txns = await getDocs(
    query(
      collection(db, 'inventory_transactions'),
      where('itemModelId', '==', itemModelId)
    )
  );
  let stock = 0;
  txns.forEach((d) => {
    const t = d.data();
    stock += t.type === 'incoming' ? t.quantity : -t.quantity;
  });
  await updateDoc(doc(db, 'item_models', itemModelId), { currentStock: stock });
}
