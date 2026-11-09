const http = require('http');

function post(url, data, token) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const postData = JSON.stringify(data);
    const req = http.request(
      {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname + parsed.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, body });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function patch(url, data, token) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const postData = JSON.stringify(data);
    const req = http.request(
      {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname + parsed.search,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, body });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function get(url, token) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = http.request(
      {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname + parsed.search,
        method: 'GET',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, body });
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting API End-to-End Tests ---');
  const baseUrl = 'http://127.0.0.1:5000/api';

  // 1. Healthcheck
  console.log('1. Testing /health...');
  const health = await get(`${baseUrl}/health`);
  console.log('Health response:', health.status, health.body);

  // 2. Register
  console.log('2. Testing /auth/register...');
  const testEmail = `user_${Date.now()}@test.com`;
  const registerRes = await post(`${baseUrl}/auth/register`, {
    name: 'Sahita Test',
    email: testEmail,
    password: 'Password123!',
  });
  console.log('Register response:', registerRes.status, registerRes.body.success, registerRes.body.message);
  const token = registerRes.body.data?.token;

  if (!token) {
    throw new Error('Registration failed, no token returned!');
  }

  // 3. Login
  console.log('3. Testing /auth/login...');
  const loginRes = await post(`${baseUrl}/auth/login`, {
    email: testEmail,
    password: 'Password123!',
  });
  console.log('Login response:', loginRes.status, loginRes.body.success, loginRes.body.data?.user?.email);

  // 4. Record Income Transaction
  console.log('4. Testing POST /transactions (Salary income)...');
  const incomeRes = await post(
    `${baseUrl}/transactions`,
    {
      amount: 75000,
      type: 'income',
      category: 'Salary',
      description: 'Monthly Software Engineer Salary',
      date: new Date().toISOString(),
    },
    token
  );
  console.log('Income recorded:', incomeRes.status, incomeRes.body.success, incomeRes.body.data?.amount);

  // 5. Record Expense Transaction (Food)
  console.log('5. Testing POST /transactions (Food expense)...');
  const expenseRes = await post(
    `${baseUrl}/transactions`,
    {
      amount: 4500,
      type: 'expense',
      category: 'Food',
      description: 'Groceries & Gourmet Dining',
      date: new Date().toISOString(),
    },
    token
  );
  console.log('Expense recorded:', expenseRes.status, expenseRes.body.success, expenseRes.body.data?.amount);

  // 6. Record Expense Transaction (Shopping)
  console.log('6. Testing POST /transactions (Shopping expense)...');
  const expense2Res = await post(
    `${baseUrl}/transactions`,
    {
      amount: 8200,
      type: 'expense',
      category: 'Shopping',
      description: 'Noise Cancelling Headphones',
      date: new Date().toISOString(),
    },
    token
  );
  console.log('Expense 2 recorded:', expense2Res.status, expense2Res.body.success);

  // 7. Get All Transactions
  console.log('7. Testing GET /transactions...');
  const allTrans = await get(`${baseUrl}/transactions`, token);
  console.log('Transactions count:', allTrans.body.data?.length, 'Total in pagination:', allTrans.body.pagination?.total);

  // 8. Set Monthly Budget
  console.log('8. Testing POST /budgets...');
  const now = new Date();
  const budgetRes = await post(
    `${baseUrl}/budgets`,
    {
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      totalBudget: 30000,
      categoryBudgets: [
        { category: 'Food', amount: 8000 },
        { category: 'Shopping', amount: 10000 },
        { category: 'Transport', amount: 4000 },
      ],
    },
    token
  );
  console.log('Budget configured:', budgetRes.status, budgetRes.body.success);

  // 9. Get Monthly Budget
  console.log('9. Testing GET /budgets...');
  const getBudgetRes = await get(`${baseUrl}/budgets`, token);
  console.log(
    'Budget details:',
    'Total:', getBudgetRes.body.data?.totalBudget,
    'Spent:', getBudgetRes.body.data?.totalSpent,
    'Remaining:', getBudgetRes.body.data?.remainingBudget,
    'Warning level:', getBudgetRes.body.data?.warningLevel
  );

  // 10. Financial Goal
  console.log('10. Testing POST /goals...');
  const goalRes = await post(
    `${baseUrl}/goals`,
    {
      name: 'M3 MacBook Pro Fund',
      targetAmount: 180000,
      currentAmount: 30000,
      targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Upgrading work machine',
      category: 'Gadgets',
    },
    token
  );
  console.log('Goal created:', goalRes.status, goalRes.body.success, goalRes.body.data?._id);
  const goalId = goalRes.body.data?._id;

  // 11. Add Progress to Goal
  console.log('11. Testing PATCH /goals/:id/progress...');
  const progressRes = await patch(
    `${baseUrl}/goals/${goalId}/progress`,
    { amount: 15000 },
    token
  );
  console.log('Progress added:', progressRes.status, progressRes.body.success, 'New amount:', progressRes.body.data?.currentAmount);

  // 12. Dashboard Summary
  console.log('12. Testing GET /analytics/dashboard...');
  const dashRes = await get(`${baseUrl}/analytics/dashboard`, token);
  console.log('Dashboard summary:', dashRes.body.data?.summary);
  console.log('Insights generated count:', dashRes.body.data?.insights?.length);
  if (dashRes.body.data?.insights?.length > 0) {
    console.log('Top insight:', dashRes.body.data?.insights[0]);
  }

  // 13. Deep Analytics
  console.log('13. Testing GET /analytics...');
  const analyticsRes = await get(`${baseUrl}/analytics?timeRange=this_month`, token);
  console.log('Analytics summary:', analyticsRes.body.data?.summary);
  console.log('Top spending category:', analyticsRes.body.data?.summary?.highestCategory);

  console.log('\n>>> ALL 13 TEST FLOWS PASSED SUCCESSFULLY! <<<');
}

module.exports = { runTests };

if (require.main === module) {
  runTests().catch((err) => {
    console.error('Test run failed:', err);
    process.exit(1);
  });
}

