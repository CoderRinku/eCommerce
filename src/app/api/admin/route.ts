import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Order } from '@/models/Order';
import { User } from '@/models/User';
import { Product } from '@/models/Product';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized. Admin access required' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const [totalOrders, totalUsers, totalProducts, orders] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Product.countDocuments({ isActive: true }),
      Order.find({}).populate('user', 'name email').sort({ createdAt: -1 }).limit(10),
    ]);

    // Calculate total sales from all non-cancelled orders
    const salesAggregate = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, totalSales: { $sum: '$totalAmount' } } },
    ]);
    const totalSales = salesAggregate[0]?.totalSales || 0;

    // Monthly sales breakdown for chart visualization
    const salesOverTime = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          sales: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]);

    const formattedSalesOverTime = salesOverTime.map((item) => {
      const monthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      return {
        name: `${monthNames[item._id.month - 1]} ${item._id.year}`,
        sales: item.sales,
        orders: item.count,
      };
    });

    return NextResponse.json({
      metrics: {
        totalSales,
        totalOrders,
        totalUsers,
        totalProducts,
      },
      recentOrders: orders,
      salesChartData: formattedSalesOverTime,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown connection error';
    return NextResponse.json(
      { message: 'Failed to fetch admin stats', error: errorMessage },
      { status: 500 }
    );
  }
}
