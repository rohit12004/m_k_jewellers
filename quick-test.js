/**
 * Quick Test - Category Lookup
 */

async function quickTest() {
    console.log('\n🧪 Testing: "What categories do you have?"\n');

    try {
        const response = await fetch('http://localhost:3000/api/chatbot/message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: "What categories do you have?",
                conversationId: crypto.randomUUID()
            })
        });

        const data = await response.json();

        console.log('✅ Response Status:', response.status);
        console.log('🔧 Tools Used:', data.data?.toolsUsed || []);
        console.log('📦 Products:', data.data?.products?.length || 0);
        console.log('⏱️  Execution Time:', data.data?.metadata?.executionTime + 'ms');
        console.log('\n💬 Reply (first 300 chars):');
        console.log(data.data?.reply?.substring(0, 300) + '...\n');

        if (data.data?.toolsUsed?.includes('category_lookup')) {
            console.log('✅ SUCCESS: category_lookup tool was used!');
        } else {
            console.log('❌ FAILED: category_lookup tool was NOT used');
            console.log('   Tools used:', data.data?.toolsUsed?.join(', ') || 'None');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

quickTest();
