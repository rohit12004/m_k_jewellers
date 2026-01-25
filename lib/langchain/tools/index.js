/**
 * Tool Registry for M.K. Jewellers AI Agent
 * 
 * This module manages all tools available to the agent.
 * Tools are functions the agent can call to get information or perform actions.
 */

import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

/**
 * Registry to store all available tools
 */
const toolRegistry = new Map();

/**
 * Register a new tool
 * @param {string} name - Tool name
 * @param {DynamicStructuredTool} tool - Tool instance
 */
export function registerTool(name, tool) {
    toolRegistry.set(name, tool);
    console.log(`✅ [ToolRegistry] Registered tool: ${name}`);
}

/**
 * Get a specific tool by name
 * @param {string} name - Tool name
 * @returns {DynamicStructuredTool|null}
 */
export function getTool(name) {
    return toolRegistry.get(name) || null;
}

/**
 * Get all registered tools
 * @returns {Array<DynamicStructuredTool>}
 */
export function getAllTools() {
    return Array.from(toolRegistry.values());
}

/**
 * Get tool names
 * @returns {Array<string>}
 */
export function getToolNames() {
    return Array.from(toolRegistry.keys());
}

/**
 * Clear all tools (useful for testing)
 */
export function clearTools() {
    toolRegistry.clear();
    console.log("🗑️ [ToolRegistry] Cleared all tools");
}

/**
 * Helper function to create a tool with standard error handling
 * @param {Object} config - Tool configuration
 * @returns {DynamicStructuredTool}
 */
export function createTool({ name, description, schema, func }) {
    return new DynamicStructuredTool({
        name,
        description,
        schema,
        func: async (input) => {
            try {
                console.log(`🔧 [Tool:${name}] Executing with input:`, input);
                const result = await func(input);
                console.log(`✅ [Tool:${name}] Success`);
                return result;
            } catch (error) {
                console.error(`❌ [Tool:${name}] Error:`, error.message);
                throw error;
            }
        }
    });
}

// Export for convenience
export { z };
