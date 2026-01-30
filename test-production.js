import fetch from 'node-fetch';

async function testProduction() {
  console.log('🧪 Testing production deployment...');
  
  try {
    // Test 1: Check if site loads
    const response = await fetch('https://sage-dashboard-gold.vercel.app/');
    console.log(`✅ Site loads: ${response.status} ${response.statusText}`);
    
    // Test 2: Check if JavaScript loads
    const jsResponse = await fetch('https://sage-dashboard-gold.vercel.app/assets/index-D4BAOAvv.js');
    console.log(`✅ JavaScript loads: ${jsResponse.status} ${jsResponse.statusText}`);
    
    // Test 3: Check if CSS loads
    const cssResponse = await fetch('https://sage-dashboard-gold.vercel.app/assets/index-DeShTGAn.css');
    console.log(`✅ CSS loads: ${cssResponse.status} ${cssResponse.statusText}`);
    
    console.log('\n🎉 Production site is accessible!');
    
  } catch (error) {
    console.error('❌ Error testing production:', error.message);
  }
}

testProduction();
