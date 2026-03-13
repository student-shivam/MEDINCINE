const Sale = require('../models/Sale');
const Medicine = require('../models/Medicine');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get comprehensive dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private (Admin/Manager)
exports.getDashboardStats = asyncHandler(async (req, res, next) => {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const thirtyDaysFromNow = new Date(now);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const isAuthorizedForFinance = ['admin', 'manager'].includes(req.user?.role);
    const isPharmacist = req.user?.role === 'pharmacist';
    const canSeeStats = isAuthorizedForFinance || isPharmacist;

    // 1. Today's Statistics
    const todayStats = canSeeStats ? await Sale.aggregate([
        { $match: { createdAt: { $gte: startOfToday } } },
        {
            $group: {
                _id: null,
                revenue: { $sum: '$grandTotal' },
                orders: { $sum: 1 }
            }
        }
    ]) : [];

    console.log(`[DASHBOARD-DEBUG] Today's Stats for User Role ${req.user?.role}: ${JSON.stringify(todayStats)} (Start of day: ${startOfToday.toISOString()})`);

    const todaySales = todayStats[0]?.revenue || 0;
    const todayOrders = todayStats[0]?.orders || 0;

    // 2. Monthly Stats & Growth
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const monthlyStats = canSeeStats ? await Sale.aggregate([
        { $match: { createdAt: { $gte: startOfPrevMonth } } },
        {
            $group: {
                _id: {
                    month: { $month: '$createdAt' },
                    year: { $year: '$createdAt' }
                },
                revenue: { $sum: '$grandTotal' }
            }
        }
    ]) : [];

    const currentMonth_Id = { month: now.getMonth() + 1, year: now.getFullYear() };
    const prevMonth_Id = { month: now.getMonth() || 12, year: now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear() };

    const currentMonthRevenue = monthlyStats.find(d => d._id.month === currentMonth_Id.month && d._id.year === currentMonth_Id.year)?.revenue || 0;
    const prevMonthRevenue = monthlyStats.find(d => d._id.month === prevMonth_Id.month && d._id.year === prevMonth_Id.year)?.revenue || 0;

    let salesGrowth = 0;
    if (prevMonthRevenue > 0) {
        salesGrowth = ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100;
    } else if (currentMonthRevenue > 0) {
        salesGrowth = 100;
    }

    // 3. All Time Totals
    let totalRevenue = 0;
    let totalOrdersCount = 0;
    let totalProfit = 0;

    if (canSeeStats) {
        const grandTotals = await Sale.aggregate([
            {
                $group: {
                    _id: null,
                    revenue: { $sum: '$grandTotal' },
                    count: { $sum: 1 },
                    profit: { $sum: '$totalProfit' }
                }
            }
        ]);
        totalRevenue = grandTotals[0]?.revenue || 0;
        totalOrdersCount = grandTotals[0]?.count || 0;
        totalProfit = grandTotals[0]?.profit || 0;
    }

    // 4. Inventory Alerts
    const lowStockCount = await Medicine.countDocuments({
        $or: [
            { stock: { $lte: 10 } },
            { quantity: { $lte: 10 } }
        ]
    });

    const expiringCount = await Medicine.countDocuments({
        expiryDate: { $gte: now, $lte: thirtyDaysFromNow }
    });

    // 5. Top Selling
    const topSelling = canSeeStats ? await Sale.aggregate([
        { $unwind: '$medicines' },
        {
            $group: {
                _id: '$medicines.medicine',
                count: { $sum: '$medicines.quantity' },
                revenue: { $sum: '$medicines.itemTotal' }
            }
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
            $lookup: {
                from: 'medicines',
                localField: '_id',
                foreignField: '_id',
                as: 'medicineInfo'
            }
        },
        { $unwind: '$medicineInfo' },
        {
            $project: {
                name: '$medicineInfo.name',
                count: 1,
                revenue: 1
            }
        }
    ]) : [];

    // 6. Recent Activity
    const recentActivity = await Sale.find({
        createdAt: { $gte: startOfToday }
    })
        .populate('medicines.medicine', 'name')
        .sort({ createdAt: -1 })
        .limit(10);

    // 7. Store Distribution
    const storeWiseRevenue = canSeeStats ? await Sale.aggregate([
        {
            $group: {
                _id: '$storeId',
                revenue: { $sum: '$grandTotal' }
            }
        },
        { $sort: { revenue: -1 } }
    ]) : [];

    const detailedLowStock = await Medicine.find({
        $expr: { $lte: ['$quantity', '$lowStockThreshold'] },
        quantity: { $gt: 0 }
    }).select('name quantity lowStockThreshold unit').limit(5);

    const detailedExpiring = await Medicine.find({
        expiryDate: { $gte: now, $lte: thirtyDaysFromNow }
    }).select('name expiryDate quantity').sort({ expiryDate: 1 }).limit(5);

    res.status(200).json({
        success: true,
        data: {
            summary: {
                todaySales: Number(todaySales),
                todayOrders: Number(todayOrders),
                currentMonthRevenue: Number(currentMonthRevenue),
                totalOrdersCount: Number(totalOrdersCount),
                totalRevenue: Number(totalRevenue),
                totalProfit: Number(totalProfit),
                salesGrowth: Number(salesGrowth).toFixed(2),
                lowStockCount: Number(lowStockCount),
                expiringCount: Number(expiringCount),
                debugCount: Number(totalOrdersCount)
            },
            topSelling: topSelling || [],
            storeWiseRevenue: storeWiseRevenue || [],
            recentActivity: recentActivity || [],
            alerts: {
                lowStock: detailedLowStock || [],
                expiring: detailedExpiring || []
            }
        }
    });
});
