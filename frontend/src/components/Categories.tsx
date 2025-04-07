import { mockSpendingByCategory } from '@/data/mockData';

export default function Categories() {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Spending by Category</h2>
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="space-y-4">
            {mockSpendingByCategory.map((category) => (
              <div
                key={category.category}
                className="flex items-center justify-between"
              >
                <p className="text-gray-600">{category.category}</p>
                <p className="font-medium text-gray-900">
                  ${category.amount.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
