import Image from "next/image";

export default function Home() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Overview</h1>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-gray-500 text-sm">Net Worth</h3>
          <p className="text-2xl font-bold">$85,450</p>
          <span className="text-green-500 text-sm">+2.4%</span>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-gray-500 text-sm">Monthly Savings</h3>
          <p className="text-2xl font-bold">$2,100</p>
          <span className="text-green-500 text-sm">+$300</span>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-gray-500 text-sm">Total Debt</h3>
          <p className="text-2xl font-bold">$15,200</p>
          <span className="text-red-500 text-sm">-$500</span>
        </div>
      </div>
      
      {/* Recent Transactions */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="font-medium">Grocery Shopping</p>
              <p className="text-sm text-gray-500">Apr 5, 2025</p>
            </div>
            <span className="text-red-500">-$82.50</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="font-medium">Salary Deposit</p>
              <p className="text-sm text-gray-500">Apr 1, 2025</p>
            </div>
            <span className="text-green-500">+$3,500.00</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="font-medium">Netflix Subscription</p>
              <p className="text-sm text-gray-500">Apr 1, 2025</p>
            </div>
            <span className="text-red-500">-$15.99</span>
          </div>
        </div>
      </div>
    </div>
  );
}
