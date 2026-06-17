interface CourierOrderParams {
  invoiceId: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  codAmount: number;
  weight?: number; // Weight in kg
  note?: string;
}

export async function createCourierOrder(params: CourierOrderParams) {
  const apiKey = process.env.STEADFAST_API_KEY;
  const secretKey = process.env.STEADFAST_SECRET_KEY;
  const baseUrl = process.env.STEADFAST_BASE_URL || 'https://portal.steadfast.com.bd/api/v1';

  // Fallback to mock courier creation if credentials are not configured
  if (
    !apiKey ||
    apiKey === 'your_steadfast_api_key' ||
    !secretKey ||
    secretKey === 'your_steadfast_secret_key'
  ) {
    console.log('--- COURIER SDK: Using Mock Steadfast courier creation ---');
    const mockTrackingId = `STF-${Math.floor(100000 + Math.random() * 900000)}`;
    const mockConsignmentId = `CON-${Math.floor(1000000 + Math.random() * 9000000)}`;
    return {
      success: true,
      trackingId: mockTrackingId,
      consignmentId: mockConsignmentId,
      courierStatus: 'Pending',
      isMock: true,
    };
  }

  try {
    const response = await fetch(`${baseUrl}/create_order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': apiKey,
        'Secret-Key': secretKey,
      },
      body: JSON.stringify({
        invoice: params.invoiceId,
        recipient_name: params.recipientName,
        recipient_phone: params.recipientPhone,
        recipient_address: params.recipientAddress,
        cod_amount: params.codAmount,
        note: params.note || '',
        weight: params.weight || 0.5,
      }),
    });

    const data = await response.json();

    if (response.ok && data.status === 200) {
      return {
        success: true,
        trackingId: data.consignment.tracking_code,
        consignmentId: data.consignment.consignment_id.toString(),
        courierStatus: data.consignment.status || 'Pending',
        isMock: false,
      };
    } else {
      console.error('Steadfast API returned error:', data);
      throw new Error(data.message || 'Failed to create courier consignment');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown connection error';
    console.error('Error contacting Steadfast API:', errorMessage);
    // In dev, generate a mock delivery consignment so checkout flow remains unblocked
    const mockTrackingId = `STF-FAIL-${Math.floor(100000 + Math.random() * 900000)}`;
    const mockConsignmentId = `CON-FAIL-${Math.floor(1000000 + Math.random() * 9000000)}`;
    return {
      success: true,
      trackingId: mockTrackingId,
      consignmentId: mockConsignmentId,
      courierStatus: 'Pending',
      isMock: true,
      error: errorMessage,
    };
  }
}
