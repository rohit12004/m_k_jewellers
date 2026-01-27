/**
 * Comprehensive Tool Test
 */

async function comprehensiveTest() {
    const tests = [
        {
            name: "Category Lookup",
            query: "What categories do you have?",
            expectedTool: "category_lookup"
        },
        {
            name: "Product Search",
            query: "Show me gold rings",
            expectedTool: "product_search"
        },
        {
            name: "Knowledge Search",
            query: "What is your return policy?",
            expectedTool: "knowledge_search"
        }
    ];

    console.log('\n' + '='.repeat(80));
    console.log('🧪 COMPREHENSIVE TOOL CALLING TEST');
    console.log('='.repeat(80) + '\n');

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
        console.log(`\n📝 Testing: ${test.name}`);
        console.log(`   Query: "${test.query}"`);
        console.log(`   Expected: ${test.expectedTool}\n`);

        try {
            const response = await fetch('http://localhost:3000/api/chatbot/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: test.query,
                    conversationId: crypto.randomUUID()
                })
            });

            const data = await response.json();
            const toolsUsed = data.data?.toolsUsed || [];

            if (toolsUsed.includes(test.expectedTool)) {
                console.log(`   ✅ PASS - Tool "${test.expectedTool}" was used`);
                console.log(`   Tools: ${toolsUsed.join(', ')}`);
                passed++;
            } else {
                console.log(`   ❌ FAIL - Tool "${test.expectedTool}" was NOT used`);
                console.log(`   Tools: ${toolsUsed.join(', ') || 'None'}`);
                failed++;
            }

        } catch (error) {
            console.log(`   ❌ ERROR: ${error.message}`);
            failed++;
        }

        // Wait between tests
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('\n' + '='.repeat(80));
    console.log(`📊 RESULTS: ${passed}/${tests.length} passed`);
    console.log('='.repeat(80) + '\n');
}

comprehensiveTest();
