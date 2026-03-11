const Sale = require('../models/Sale');
const Medicine = require('../models/Medicine');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get comprehensive dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private (Admin/Manager)
exports.getDashboardStats = asyncHandler(async (req, res, next) => {
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const prevMonthStart = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    // Role checking
    const isAdmin = req.user?.role === 'admin';

    // 1. Today's Sales (Masked)
    const todaySalesData = isAdmin ? await Sale.aggregate([
        { $match: { createdAt: { $gte: todayStart } } },
        { $group: { _id: null, total: { $sum: '$grandTotal' }, count: { $sum: 1 } } }
    ]) : [];
    const todaySales = todaySalesData[0]?.total || 0;
    const todayOrders = todaySalesData[0]?.count || 0;

    // 2. Monthly Revenue & Growth (Masked)
    const revenueData = isAdmin ? await Sale.aggregate([
        {
            $match: {
                createdAt: { $gte: prevMonthStart }
            }
        },
        {
            $group: {
                _id: {
                    month: { $month: '$createdAt' },
                    year: { $year: '$createdAt' }
                },
                revenue: { $sum: '$grandTotal' }
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]) : [];

    const currentMonthRevenue = revenueData.find(d => d._id.month === (new Date().getMonth() + 1))?.revenue || 0;
    const prevMonthRevenue = revenueData.find(d => d._id.month === (new Date().getMonth()))?.revenue || 0;

    let salesGrowth = 0;
    if (prevMonthRevenue > 0) {
        salesGrowth = ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100;
    } else if (currentMonthRevenue > 0) {
        salesGrowth = 100;
    }

    // 3. Total Metrics (Masked)
    let totalRevenue = 0;
    let totalOrdersCount = 0;
    let totalProfit = 0;

    if (isAdmin) {
        const totalMetrics = await Sale.aggregate([
            { $unwind: '$medicines' },
            {
                $group: {
                    _id: null,
                    totalProfit: {
                        $sum: {
                            $multiply: [
                                { $subtract: ['$medicines.sellingPrice', '$medicines.purchasePrice'] },
                                '$medicines.quantity'
                            ]
                        }
                    }
                }
            }
        ]);

        const totalRevenueSum = await Sale.aggregate([{ $group: { _id: null, total: { $sum: '$grandTotal' }, count: { $sum: 1 } } }]);
        totalRevenue = totalRevenueSum[0]?.total || 0;
        totalOrdersCount = totalRevenueSum[0]?.count || 0;
        totalProfit = totalMetrics[0]?.totalProfit || 0;
    }

    // 4. Top Selling Medicines (Masked for Financials)
    const topSelling = isAdmin ? await Sale.aggregate([
        { $unwind: '$medicines' },
        {
            $group: {
                _id: '$medicines.medicine',
                totalSold: { $sum: '$medicines.quantity' },
                revenue: { $sum: '$medicines.itemTotal' }
            }
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
        {
            $lookup: {
                from: 'medicines',
                localField: '_id',
                foreignField: '_id',
                as: 'details'
            }
        },
        { $unwind: '$details' },
        {
            $project: {
                name: '$details.name',
                totalSold: 1,
                revenue: 1
            }
        }
    ]) : [];

    // 5. Stock Alerts (Visible to All)
    const lowStockCount = await Medicine.countDocuments({
        $expr: { $lte: ['$quantity', '$lowStockThreshold'] },
        quantity: { $gt: 0 }
    });

    const expiringCount = await Medicine.countDocuments({
        expiryDate: { $gte: new Date(), $lte: thirtyDaysFromNow }
    });

    // 6. Store-wise Revenue (Masked)
    const storeWiseRevenue = isAdmin ? await Sale.aggregate([
        {
            $group: {
                _id: '$storeId',
                revenue: { $sum: '$grandTotal' }
            }
        },
        { $sort: { revenue: -1 } }
    ]) : [];

    res.status(200).json({
        success: true,
        data: {
            summary: {
                todaySales: isAdmin ? todaySales : null,
                todayOrders: isAdmin ? todayOrders : null,
                currentMonthRevenue: isAdmin ? currentMonthRevenue : null,
                totalOrdersCount: isAdmin ? totalOrdersCount : null,
                totalRevenue: isAdmin ? totalRevenue : null,
                totalProfit: isAdmin ? totalProfit : null,
                salesGrowth: isAdmin ? salesGrowth.toFixed(2) : null,
                lowStockCount,
                expiringCount
            },
            topSelling: isAdmin ? topSelling : [],
            storeWiseRevenue: isAdmin ? storeWiseRevenue : []
        }
    });
});
