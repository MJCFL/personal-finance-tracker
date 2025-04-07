export default function Settings() {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Settings</h2>
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Currency</p>
                <p className="text-sm text-gray-500">Set your preferred currency</p>
              </div>
              <select className="form-select rounded-md border-gray-300">
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Dark Mode</p>
                  <p className="text-sm text-gray-500">Toggle dark mode theme</p>
                </div>
                <button className="bg-gray-200 rounded-full w-12 h-6 flex items-center p-1">
                  <div className="bg-white w-4 h-4 rounded-full shadow-sm"></div>
                </button>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Notifications</p>
                  <p className="text-sm text-gray-500">Enable email notifications</p>
                </div>
                <button className="bg-green-500 rounded-full w-12 h-6 flex items-center p-1 justify-end">
                  <div className="bg-white w-4 h-4 rounded-full shadow-sm"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
