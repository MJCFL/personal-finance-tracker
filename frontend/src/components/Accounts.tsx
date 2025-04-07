import { mockAccounts } from '@/data/mockData';

export default function Accounts() {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Accounts</h2>
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="space-y-4">
            {mockAccounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between border-b pb-4 last:border-0"
              >
                <div>
                  <p className="font-medium text-gray-900">{account.name}</p>
                  <p className="text-sm text-gray-500">{account.institution}</p>
                </div>
                <p
                  className={`text-lg font-semibold ${
                    account.balance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  ${Math.abs(account.balance).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
