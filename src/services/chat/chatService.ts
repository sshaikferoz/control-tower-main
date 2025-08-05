export interface ChatbotResponse {
  content: string;
  metadata?: {
    type?: string;
    timestamp?: string;
  };
}

const faqs: Record<string, string> = {
  'What is an Inventory Aging Trends Report? Why is it Important?': `
    <h2 class="text-xl font-bold text-[rgb(132 204 22)] mb-4">1. Overview</h2>
    <p class="mb-4">An Inventory Aging Trends Report tracks the age of inventory items from the time they enter your warehouse or storage facility. It categorizes inventory based on how long items have been in stock.</p>
    
    <h2 class="text-xl font-bold text-[#84cc16] mb-4">2. Key Components</h2>
    <ul class="list-disc pl-5 mb-4">
      <li>Age Brackets: Items categorized by time periods (e.g., 0-30 days, 31-60 days, 61-90 days, 90+ days)</li>
      <li>Quantity in Each Bracket: Amount of inventory in each age category</li>
      <li>Value in Each Bracket: Financial value of inventory in each age category</li>
      <li>Percentage of Total: Portion of inventory represented by each age bracket</li>
    </ul>

    <h2 class="text-xl font-bold text-[#84cc16] mb-4">3. Why It's Important</h2>
    <ul class="list-disc pl-5 mb-4">
      <li>Identifies slow-moving or obsolete inventory that ties up capital</li>
      <li>Helps prevent stock spoilage and expiration issues</li>
      <li>Supports optimal warehouse space utilization</li>
      <li>Enables better cash flow management</li>
    </ul>

    <h2 class="text-xl font-bold text-[#84cc16] mb-4">4. Strategic Uses</h2>
    <p>Using inventory aging trends, businesses can:</p>
    <ul class="list-disc pl-5 mb-4">
      <li>Implement targeted promotions for aging stock</li>
      <li>Adjust purchasing patterns to reduce overstock</li>
      <li>Optimize warehouse organization based on turnover rates</li>
      <li>Make informed decisions about inventory write-offs</li>
    </ul>
  `,

  'Summary of Purchase Order by Material Type Report? Why is it Important?': `
    <p class="mb-4">A "Purchase Order by Material Type" report provides a summarized view of purchase order (PO) data categorized by different types of materials. Here's a typical summary of what such a report includes:</p>
    
    <h2 class="text-xl font-bold text-[#84cc16] mb-4">1. Overview</h2>
    <p class="mb-4">This report categorizes and summarizes purchase orders based on material types (e.g., Raw Materials, Packaging, Consumables, Spare Parts, Finished Goods, etc.). It helps procurement, finance, and supply chain teams track spending and supplier engagement by material category.</p>
    
    <h2 class="text-xl font-bold text-[#84cc16] mb-4">2. Key Components</h2>
    <ul class="list-disc pl-5 mb-4">
      <li>Material Type Classification of materials (e.g., ROH - Raw Materials, FERT - Finished Goods)</li>
      <li>Total POs: Number of purchase orders raised for each material type</li>
      <li>PO Quantity: Total quantity of materials ordered under each type</li>
      <li>PO Value: Total monetary value of the POs for each material type</li>
      <li>Suppliers Involved: Number of suppliers associated with each material type</li>
      <li>Average Unit Price: Average cost per unit for each material type</li>
      <li>Delivery Status: Summary of order fulfillment (e.g., Delivered, Pending, Delayed)</li>
    </ul>

    <h2 class="text-xl font-bold text-[#84cc16] mb-4">3. Use Cases</h2>
    <ul class="list-disc pl-5 mb-4">
      <li><strong>Procurement Planning</strong> – Understand which material types are most frequently ordered</li>
      <li><strong>Cost Analysis</strong> – Track high-spending categories to optimize procurement strategies</li>
      <li><strong>Supplier Performance</strong> – Identify which material types are often delayed or under-delivered</li>
      <li><strong>Inventory Forecasting</strong> – Align purchase trends with inventory needs and production schedules</li>
    </ul>

    <h2 class="text-xl font-bold text-[#84cc16] mb-4">4. Embrace Digital Transformation</h2>
    <p class="mb-4">Stay competitive by adopting tech innovations:</p>
    <ul class="list-disc pl-5 mb-4">
      <li><strong>AI & Machine Learning:</strong> For demand forecasting, risk analysis, and supplier evaluation</li>
      <li>Enable real-time communication and shared dashboards</li>
      <li>Co-develop products with key suppliers</li>
      <li>Conduct supplier audits and risk assessments</li>
    </ul>
    <p class="text-green-400">✓ Benefits: Reduces risk, ensures continuity, and improves quality.</p>
  
    <h2 class="text-xl font-bold text-yellow-400 mb-4">⚡ 4. Build Resilience and Agility</h2>
    <p class="mb-4">Post-pandemic lessons: flexibility is key.</p>
    <ul class="list-disc pl-5 mb-4">
      <li>Diversify suppliers and avoid single points of failure</li>
      <li>Maintain buffer stock for critical materials</li>
      <li>Use scenario planning and digital twins for supply chain simulations</li>
      <li>Adopt just-in-case (vs. just-in-time) strategies when needed</li>
    </ul>
    <p class="text-green-400">✓ Benefits: Handles disruption better, ensures delivery.</p>
  
    <h2 class="text-xl font-bold text-blue-400 mb-4">📊 5. Data-Driven Decision Making</h2>
    <p class="mb-4">Leverage analytics and dashboards:</p>
    <ul class="list-disc pl-5 mb-4">
      <li>Use predictive analytics for smarter procurement decisions</li>
      <li>Track KPIs like supplier performance, lead time, and cost savings</li>
      <li>Monitor in real-time using IoT sensors, GPS, and RFID</li>
    </ul>
    <p class="text-green-400">✓ Benefits: Faster response, better insights, proactive actions.</p>
  `,

  'What are the Purchase Requisition and how are they used?': `
    <h2 class="text-xl font-bold text-[#84cc16] mb-4">1. Purchase Requisition Definition</h2>
    <p class="mb-4">A Purchase Requisition (PR) is an internal document that formally requests the procurement department to purchase goods or services. It's the first step in the procure-to-pay process, initiated by an employee or department needing specific items.</p>
    
    <h2 class="text-xl font-bold text-[#84cc16] mb-4">2. Key Components of a PR</h2>
    <ul class="list-disc pl-5 mb-4">
      <li>Requisition Number: Unique identifier for tracking</li>
      <li>Requestor Information: Name, department, contact details</li>
      <li>Date Required: When items are needed</li>
      <li>Item Details: Description, quantity, specifications, estimated cost</li>
      <li>Cost Center/Account: For budgeting and accounting purposes</li>
      <li>Justification: Business reason for the purchase</li>
      <li>Approval Fields: For required authorization signatures</li>
    </ul>

    <h2 class="text-xl font-bold text-[#84cc16] mb-4">3. The PR Process</h2>
    <ol class="list-decimal pl-5 mb-4">
      <li>Creation: Employee identifies need and creates requisition</li>
      <li>Review: Department manager reviews for necessity and budget alignment</li>
      <li>Approval: Based on company policy and amount thresholds</li>
      <li>Submission: Approved PR sent to procurement</li>
      <li>Conversion: Procurement converts PR to Purchase Order (PO)</li>
    </ol>

    <h2 class="text-xl font-bold text-[#84cc16] mb-4">4. Benefits of Using PRs</h2>
    <ul class="list-disc pl-5 mb-4">
      <li><strong>Budget Control:</strong> Ensures spending aligns with budgets</li>
      <li><strong>Approval Transparency:</strong> Creates audit trail of purchase authorizations</li>
      <li><strong>Spend Visibility:</strong> Helps track departmental and project expenses</li>
      <li><strong>Process Efficiency:</strong> Streamlines procurement workflow</li>
      <li><strong>Compliance:</strong> Supports adherence to purchasing policies</li>
    </ul>

    <h2 class="text-xl font-bold text-[#84cc16] mb-4">5. Types of Purchase Requisitions</h2>
    <ul class="list-disc pl-5 mb-4">
      <li><strong>Standard PR:</strong> For one-time purchases</li>
      <li><strong>Blanket PR:</strong> For recurring purchases over a specified period</li>
      <li><strong>Emergency PR:</strong> For urgent needs with expedited approval</li>
      <li><strong>Service PR:</strong> For service contracts rather than physical goods</li>
    </ul>
  `,

  'What is a Purchase order martial type? Why is Material Type Important in a PO?': `
    <h2 class="text-xl font-bold text-[#84cc16] mb-4">1. Material Type Definition</h2>
    <p class="mb-4">In procurement systems, Material Type is a classification code that categorizes items based on their nature, usage, and accounting treatment. Common material types include:</p>
    <ul class="list-disc pl-5 mb-4">
      <li><strong>ROH (Raw Materials):</strong> Basic inputs for manufacturing</li>
      <li><strong>HALB (Semi-finished Products):</strong> Partially completed products</li>
      <li><strong>FERT (Finished Goods):</strong> Completed products ready for sale</li>
      <li><strong>HIBE (Operating Supplies):</strong> Items consumed in operations</li>
      <li><strong>DIEN (Services):</strong> Non-physical services</li>
      <li><strong>NLAG (Non-stock Items):</strong> Items not kept in inventory</li>
    </ul>
    
    <h2 class="text-xl font-bold text-[#84cc16] mb-4">2. Importance in Purchase Orders</h2>
    <ul class="list-disc pl-5 mb-4">
      <li><strong>Accounting Treatment:</strong> Different material types are posted to different GL accounts</li>
      <li><strong>Inventory Management:</strong> Affects how items are received, stored, and tracked</li>
      <li><strong>Taxation:</strong> May determine applicable tax rates and exemptions</li>
      <li><strong>Valuation:</strong> Influences how items are valued on the balance sheet</li>
      <li><strong>Reporting:</strong> Enables spend analysis by material category</li>
    </ul>

    <h2 class="text-xl font-bold text-[#84cc16] mb-4">3. Business Benefits</h2>
    <p class="mb-4">Using material types in POs provides several advantages:</p>
    <ul class="list-disc pl-5 mb-4">
      <li><strong>Strategic Sourcing:</strong> Allows category-based procurement strategies</li>
      <li><strong>Cost Control:</strong> Better visibility into spending by material category</li>
      <li><strong>Supplier Management:</strong> Helps identify preferred suppliers by material type</li>
      <li><strong>Compliance:</strong> Ensures proper handling of regulated materials</li>
      <li><strong>Process Automation:</strong> Enables automated workflows based on material type</li>
    </ul>

    <h2 class="text-xl font-bold text-[#84cc16] mb-4">4. Implementation Best Practices</h2>
    <ul class="list-disc pl-5 mb-4">
      <li>Develop a standardized material type coding system</li>
      <li>Train procurement staff on proper material type classification</li>
      <li>Regularly audit material type assignments for accuracy</li>
      <li>Integrate material types with inventory and financial systems</li>
      <li>Use material type data for strategic procurement planning</li>
    </ul>
  `,

  'Differentiation between Unreleased PRs and PRs Under Procurement?': `
    <h2 class="text-xl font-bold text-[#84cc16] mb-4">1. Status Definitions</h2>
    
    <h3 class="text-lg font-semibold mb-2">Unreleased PRs:</h3>
    <p class="mb-4">Purchase Requisitions that have been created but haven't yet completed the internal approval process required to release them to the procurement department.</p>
    
    <h3 class="text-lg font-semibold mb-2">PRs Under Procurement:</h3>
    <p class="mb-4">Purchase Requisitions that have received all necessary approvals, been released to the procurement department, and are actively being processed but haven't yet been converted to Purchase Orders.</p>
    
    <h2 class="text-xl font-bold text-[#84cc16] mb-4">2. Key Differences</h2>
    
    <table class="w-full border-collapse mb-4">
      <thead>
        <tr class="bg-blue-900">
          <th class="border border-gray-600 px-4 py-2">Aspect</th>
          <th class="border border-gray-600 px-4 py-2">Unreleased PRs</th>
          <th class="border border-gray-600 px-4 py-2">PRs Under Procurement</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="border border-gray-600 px-4 py-2 font-bold">Stage in Process</td>
          <td class="border border-gray-600 px-4 py-2">Pre-approval, internal to requesting department</td>
          <td class="border border-gray-600 px-4 py-2">Post-approval, with procurement team</td>
        </tr>
        <tr>
          <td class="border border-gray-600 px-4 py-2 font-bold">Visibility</td>
          <td class="border border-gray-600 px-4 py-2">Limited to requestor and approvers</td>
          <td class="border border-gray-600 px-4 py-2">Visible to procurement and requestors</td>
        </tr>
        <tr>
          <td class="border border-gray-600 px-4 py-2 font-bold">Next Step</td>
          <td class="border border-gray-600 px-4 py-2">Approval and release</td>
          <td class="border border-gray-600 px-4 py-2">Supplier selection and PO creation</td>
        </tr>
        <tr>
          <td class="border border-gray-600 px-4 py-2 font-bold">Budget Impact</td>
          <td class="border border-gray-600 px-4 py-2">Potential commitment (pre-encumbrance)</td>
          <td class="border border-gray-600 px-4 py-2">Committed funds (encumbrance)</td>
        </tr>
      </tbody>
    </table>

    <h2 class="text-xl font-bold text-[#84cc16] mb-4">3. Management Implications</h2>
    <ul class="list-disc pl-5 mb-4">
      <li><strong>Unreleased PRs:</strong> 
        <ul class="list-circle pl-5">
          <li>Indicate potential future spend</li>
          <li>May require follow-up to expedite approvals</li>
          <li>Useful for early demand visibility</li>
        </ul>
      </li>
      <li><strong>PRs Under Procurement:</strong>
        <ul class="list-circle pl-5">
          <li>Represent firm commitments</li>
          <li>Key focus for procurement KPIs (cycle time)</li>
          <li>Critical for supplier negotiations</li>
        </ul>
      </li>
    </ul>

    <h2 class="text-xl font-bold text-[#84cc16] mb-4">4. Best Practice Monitoring</h2>
    <p class="mb-4">For optimal procurement performance:</p>
    <ul class="list-disc pl-5 mb-4">
      <li>Track volume and aging of both categories</li>
      <li>Establish SLAs for moving PRs through each status</li>
      <li>Implement escalation procedures for stuck PRs</li>
      <li>Use dashboards to visualize bottlenecks</li>
    </ul>
  `,

  'What are the challenges of Material Consumption? Why is it Important?': `
    <h2 class="text-xl font-bold text-[#84cc16] mb-4">1. Material Consumption Definition</h2>
    <p class="mb-4">Material consumption refers to the process of using or consuming materials in production processes, services, or operations. It involves tracking how materials flow through your organization, from requisition to final usage.</p>
    
    <h2 class="text-xl font-bold text-[#84cc16] mb-4">2. Key Challenges</h2>
    
    <h3 class="text-lg font-semibold mb-2">Consumption Accuracy:</h3>
    <ul class="list-disc pl-5 mb-4">
      <li>Inaccurate recording of actual material usage</li>
      <li>Discrepancies between theoretical and actual consumption</li>
      <li>Manual recording errors and timing issues</li>
      <li>Lack of real-time consumption tracking</li>
    </ul>
    
    <h3 class="text-lg font-semibold mb-2">Inventory Management:</h3>
    <ul class="list-disc pl-5 mb-4">
      <li>Stockouts leading to production delays</li>
      <li>Excess inventory tying up working capital</li>
      <li>Shelf-life management and obsolescence</li>
      <li>Storage constraints and handling costs</li>
    </ul>
    
    <h3 class="text-lg font-semibold mb-2">Waste and Efficiency:</h3>
    <ul class="list-disc pl-5 mb-4">
      <li>Material waste due to poor processes</li>
      <li>Deviation from standard consumption rates</li>
      <li>Quality issues requiring rework or scrap</li>
      <li>Inefficient material utilization</li>
    </ul>
    
    <h3 class="text-lg font-semibold mb-2">Planning Complexities:</h3>
    <ul class="list-disc pl-5 mb-4">
      <li>Demand variability affecting consumption patterns</li>
      <li>Poor forecasting leading to suboptimal purchases</li>
      <li>Engineering changes impacting material requirements</li>
      <li>Batch size optimization challenges</li>
    </ul>

    <h2 class="text-xl font-bold text-[#84cc16] mb-4">3. Why Material Consumption Is Important</h2>
    <ul class="list-disc pl-5 mb-4">
      <li><strong>Cost Control:</strong> Materials often represent 50-70% of production costs</li>
      <li><strong>Financial Accuracy:</strong> Impacts COGS, inventory valuation, and profitability</li>
      <li><strong>Production Efficiency:</strong> Influences throughput and manufacturing performance</li>
      <li><strong>Sustainability:</strong> Affects environmental footprint and waste reduction initiatives</li>
      <li><strong>Compliance:</strong> May be subject to regulatory reporting (e.g., hazardous materials)</li>
    </ul>

    <h2 class="text-xl font-bold text-[#84cc16] mb-4">4. Best Practices for Improvement</h2>
    <ul class="list-disc pl-5 mb-4">
      <li>Implement real-time consumption tracking systems</li>
      <li>Establish standard consumption rates and monitor variances</li>
      <li>Integrate material consumption with MRP/ERP systems</li>
      <li>Train staff on proper material handling and usage recording</li>
      <li>Perform regular consumption analysis to identify trends</li>
      <li>Use automation (barcodes, RFID, IoT) to improve accuracy</li>
    </ul>
  `,
};

export const generateResponse = async (message: string): Promise<ChatbotResponse> => {
  // Check if message matches any FAQ
  let content = '';

  // Call API
  try {
    const apiResponse = await fetch(
      `https://ctsearch.cml.apps.cdp-ds-test.aramco.com/api/chat?query=${encodeURIComponent(message)}`
    );

    if (!apiResponse.ok) {
      throw new Error(`API responded with status: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();

    if (data && data.chatbot_response) {
      // Return the chatbot response from the API
      content = data.chatbot_response;
    } else {
      // Fallback if API doesn't return expected format
      content = `
              <p>I couldn't find specific information about that. Could you please try rephrasing your question?</p>
              <p>I can help with questions about inventory management, purchase orders, and supply chain topics.</p>
            `;
    }
  } catch (error) {
    console.error('Error calling chatbot API:', error);
    content = `
            <p>I'm currently having trouble connecting to my knowledge base. Please try again in a moment.</p>
            <p>In the meantime, you might find helpful information in our FAQ section below.</p>
          `;
  }
  return {
    content,
    metadata: {
      timestamp: new Date().toISOString(),
    },
  };
};
