import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from './firebase';

const menuItems = [
  {
    name: '小菜',
    price: 70,
    description: 'Din Tai Fung House Special',
    category: '人氣推薦',
    isAvailable: true
  },
  {
    name: '元盅雞湯',
    price: 210,
    description: 'House Steamed Chicken Soup',
    category: '人氣推薦',
    isAvailable: true
  },
  {
    name: '紹興醉雞',
    price: 320,
    description: 'Shaohsing Wine Marinated Chicken',
    category: '人氣推薦',
    isAvailable: true
  },
  {
    name: '紅燒牛肉麵',
    price: 260,
    description: 'Braised Beef Noodle Soup',
    category: '人氣推薦',
    isAvailable: true
  },
  {
    name: '小籠包 (5入)',
    price: 110,
    description: 'Pork Xiaolongbao (5 pcs)',
    category: '點心',
    isAvailable: true
  },
  {
    name: '排骨蛋炒飯',
    price: 240,
    description: 'Pork Chop Fried Rice (With Egg)',
    category: '飯麵類',
    isAvailable: true
  },
  {
    name: '松露小籠包 (5入)',
    price: 450,
    description: 'Truffle and Pork Xiaolongbao (5 pcs)',
    category: '點心',
    isAvailable: true
  },
  {
    name: '紅油抄手 (蝦肉)',
    price: 180,
    description: 'House Special Spicy Shrimp and Pork Wontons (8 pcs)',
    category: '點心',
    isAvailable: true
  },
  {
    name: '蝦仁燒賣 (5入)',
    price: 180,
    description: 'Steamed Shrimp and Pork Shao Mai (5 pcs)',
    category: '點心',
    isAvailable: true
  },
  {
    name: '銀耳四寶甜湯 (冰)',
    price: 90,
    description: 'Snow Mushroom Sweet Soup (Cold)',
    category: '甜點',
    isAvailable: true
  }
];

export async function seedMenu() {
  const colRef = collection(db, 'menuItems');
  const snapshot = await getDocs(colRef);
  
  if (snapshot.empty) {
    console.log('Seeding menu items...');
    for (const item of menuItems) {
      await addDoc(colRef, item);
    }
    console.log('Menu seeding complete.');
  } else {
    console.log('Menu already has items, skipping seed.');
  }
}
