
    /**
     * ================================================================
     *  API SERVICE — separate backend connection module
     *  All backend calls are centralized here.
     *  Replace BASE_URL with your actual backend endpoint.
     * ================================================================
     */
    const ApiService = (() => {
      // ---------- CONFIG ----------
      const BASE_URL = 'https://api.example.com';  // ← CHANGE THIS to your backend URL
      const ENDPOINTS = {
        sales: '/sales',
        kpi: '/sales/kpi',
        add: '/sales',
        update: '/sales',
        delete: '/sales',
      };

      // ---------- HELPERS ----------
      async function _fetch(endpoint, options = {}) {
        const url = `${BASE_URL}${endpoint}`;
        const config = {
          headers: {
            'Content-Type': 'application/json',
            // Add auth token if needed, e.g.:
            // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          ...options,
        };
        try {
          const response = await fetch(url, config);
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
          }
          return await response.json();
        } catch (err) {
          console.error('[ApiService] fetch error:', err);
          throw err;
        }
      }

      // ---------- PUBLIC METHODS ----------
      return {
        /**
         * Get all sales records
         * @returns {Promise<Array>} array of sale objects
         */
        getSales() {
          return _fetch(ENDPOINTS.sales);
        },

        /**
         * Get KPI summary data
         * @returns {Promise<Object>} { revenue, orders, customers, avgOrder, changes }
         */
        getKpi() {
          return _fetch(ENDPOINTS.kpi);
        },

        /**
         * Add a new sale record
         * @param {Object} saleData - { customer, product, amount, date, status, ... }
         * @returns {Promise<Object>} created sale
         */
        addSale(saleData) {
          return _fetch(ENDPOINTS.add, {
            method: 'POST',
            body: JSON.stringify(saleData),
          });
        },

        /**
         * Update an existing sale
         * @param {string|number} id - sale ID
         * @param {Object} updates - fields to update
         * @returns {Promise<Object>} updated sale
         */
        updateSale(id, updates) {
          return _fetch(`${ENDPOINTS.update}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
          });
        },

        /**
         * Delete a sale
         * @param {string|number} id - sale ID
         * @returns {Promise<Object>} deletion response
         */
        deleteSale(id) {
          return _fetch(`${ENDPOINTS.delete}/${id}`, {
            method: 'DELETE',
          });
        },

        /**
         * Export sales data (returns blob for download)
         * @param {string} format - 'csv' or 'json'
         * @returns {Promise<Blob>}
         */
        exportSales(format = 'csv') {
          return fetch(`${BASE_URL}/sales/export?format=${format}`)
            .then(res => {
              if (!res.ok) throw new Error('Export failed');
              return res.blob();
            });
        },
      };
    })();


    /**
     * ================================================================
     *  UI CONTROLLER — uses ApiService to fetch and render data
     * ================================================================
     */
    (function init() {
      // DOM refs
      const tableBody = document.getElementById('salesTableBody');
      const kpiRevenue = document.getElementById('kpiRevenue');
      const kpiOrders = document.getElementById('kpiOrders');
      const kpiCustomers = document.getElementById('kpiCustomers');
      const kpiAvgOrder = document.getElementById('kpiAvgOrder');
      const kpiRevenueChange = document.getElementById('kpiRevenueChange');
      const kpiOrdersChange = document.getElementById('kpiOrdersChange');
      const kpiCustomersChange = document.getElementById('kpiCustomersChange');
      const kpiAvgOrderChange = document.getElementById('kpiAvgOrderChange');
      const rowCount = document.getElementById('rowCount');
      const lastUpdated = document.getElementById('lastUpdated');
      const toast = document.getElementById('toast');
      const toastMessage = document.getElementById('toastMessage');

      let salesData = [];

      // ---------- TOAST ----------
      function showToast(message, type = 'info') {
        toast.className = 'toast show ' + type;
        toastMessage.textContent = message;
        const icon = toast.querySelector('i');
        icon.className = type === 'success' ? 'fas fa-check-circle' :
                        type === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-info-circle';
        clearTimeout(toast._hide);
        toast._hide = setTimeout(() => {
          toast.classList.remove('show');
        }, 3500);
      }

      // ---------- RENDER TABLE ----------
      function renderTable(sales) {
        if (!sales || sales.length === 0) {
          tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:rgba(255,255,255,0.4);">
            <i class="fas fa-inbox"></i> No sales data available
          </td></tr>`;
          rowCount.textContent = '0';
          return;
        }

        let html = '';
        sales.forEach(s => {
          const statusClass = s.status?.toLowerCase() === 'completed' ? 'success' :
                              s.status?.toLowerCase() === 'pending' || s.status?.toLowerCase() === 'processing' ? 'warning' : 'danger';
          const statusIcon = s.status?.toLowerCase() === 'completed' ? 'fa-check-circle' :
                             s.status?.toLowerCase() === 'pending' || s.status?.toLowerCase() === 'processing' ? 'fa-clock' : 'fa-exclamation-circle';
          html += `
            <tr>
              <td><span class="badge">#${s.orderId || s.id || 'N/A'}</span></td>
              <td><strong>${s.customer || 'Unknown'}</strong>
                <span class="text-muted" style="display:block; font-size:0.7rem;">${s.email || ''}</span>
              </td>
              <td>${s.product || ''} · <span class="text-muted">${s.quantity || 1}x</span></td>
              <td>${s.date || ''}</td>
              <td><strong>$${Number(s.amount || 0).toFixed(2)}</strong></td>
              <td><span class="badge ${statusClass}"><i class="fas ${statusIcon}" style="margin-right:4px;"></i>${s.status || 'Unknown'}</span></td>
            </tr>
          `;
        });
        tableBody.innerHTML = html;
        rowCount.textContent = sales.length;
      }

      // ---------- RENDER KPI ----------
      function renderKpi(kpi) {
        if (!kpi) return;
        kpiRevenue.textContent = kpi.revenue ? `$${Number(kpi.revenue).toLocaleString()}` : '--';
        kpiOrders.textContent = kpi.orders?.toLocaleString() || '--';
        kpiCustomers.textContent = kpi.customers?.toLocaleString() || '--';
        kpiAvgOrder.textContent = kpi.avgOrder ? `$${Number(kpi.avgOrder).toFixed(2)}` : '--';

        const setChange = (el, val) => {
          if (val === undefined || val === null) { el.textContent = '--'; return; }
          const num = Number(val);
          const isPositive = num >= 0;
          el.textContent = `${isPositive ? '+' : ''}${num.toFixed(1)}%`;
          el.className = `change ${isPositive ? '' : 'negative'}`;
        };
        setChange(kpiRevenueChange, kpi.revenueChange);
        setChange(kpiOrdersChange, kpi.ordersChange);
        setChange(kpiCustomersChange, kpi.customersChange);
        setChange(kpiAvgOrderChange, kpi.avgOrderChange);
      }

      // ---------- LOAD DATA ----------
      async function loadData() {
        try {
          // Show loading state
          tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:rgba(255,255,255,0.4);">
            <i class="fas fa-spinner fa-pulse" style="margin-right:8px;"></i> Loading...
          </td></tr>`;

          // Fetch sales and KPI in parallel
          const [sales, kpi] = await Promise.all([
            ApiService.getSales(),
            ApiService.getKpi()
          ]);

          salesData = sales || [];
          renderTable(salesData);
          renderKpi(kpi);

          const now = new Date();
          lastUpdated.textContent = `Last 30 days · updated ${now.toLocaleTimeString()}`;
          showToast('Data refreshed successfully', 'success');
        } catch (err) {
          console.error('Load error:', err);
          tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:#f87171;">
            <i class="fas fa-exclamation-triangle"></i> Failed to load data: ${err.message}
          </td></tr>`;
          showToast(`Error: ${err.message}`, 'error');
        }
      }

      // ---------- ADD RECORD (demo) ----------
      async function handleAddRecord() {
        const demo = {
          orderId: `ORD-${String(Math.floor(Math.random() * 9000) + 1000)}`,
          customer: 'Demo User',
          email: 'demo@example.com',
          product: 'Sample Product',
          quantity: 1,
          amount: (Math.random() * 200 + 20).toFixed(2),
          date: new Date().toISOString().split('T')[0],
          status: 'Pending'
        };

        try {
          const result = await ApiService.addSale(demo);
          showToast('Record added! Refreshing...', 'success');
          await loadData(); // reload
        } catch (err) {
          // If backend not available, show a friendly message and add locally
          showToast('Backend not available — added locally (demo)', 'info');
          // Add to local data for demo
          const localDemo = { ...demo, id: Date.now() };
          salesData.unshift(localDemo);
          renderTable(salesData);
          rowCount.textContent = salesData.length;
        }
      }

      // ---------- EXPORT (demo) ----------
      function handleExport() {
        showToast('Exporting... (backend integration)', 'info');
        // Real implementation would use ApiService.exportSales()
        // For demo: show a toast and simulate download
        setTimeout(() => {
          showToast('Export simulated — check console', 'success');
          console.log('Export data:', salesData);
        }, 600);
      }

      // ---------- EVENT BINDING ----------
      document.getElementById('refreshBtn').addEventListener('click', loadData);
      document.getElementById('addRecordBtn').addEventListener('click', handleAddRecord);
      document.getElementById('exportBtn').addEventListener('click', handleExport);
      document.getElementById('printBtn').addEventListener('click', () => window.print());
      document.getElementById('pdfBtn').addEventListener('click', () => {
        showToast('PDF generation — backend required', 'info');
      });

      // ---------- INIT ----------
      loadData();

      // Auto-refresh every 60s (optional)
      // setInterval(loadData, 60000);

    })();
  </script>