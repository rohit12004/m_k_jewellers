
import { NextResponse } from "next/server"

export const response = (success, statusCode, message, data = {}) => {
    return NextResponse.json({
        success, statusCode, message, data
    }, { status: statusCode })  // Set actual HTTP status code
}

export const catchError = (error, customMessage) => {
    // Determine if the error is "safe" to show in production (e.g., validation, business logic)
    const isSafeError = error.statusCode && error.statusCode < 500;
    
    // Technical database error handling (Mongoose)
    if (error.code === 11000 && error.keyPattern) {
        const keys = Object.keys(error.keyPattern).join(",");
        error.message = `Duplicate fields: ${keys}. These fields value must be unique.`;
        error.statusCode = 409;
    }

    // Prisma Unique Constraint (P2002)
    if (error.code === 'P2002') {
        const fields = error.meta?.target?.join(', ') || 'field';
        error.message = `A unique constraint failed on the following fields: ${fields}.`;
        error.statusCode = 409;
    }

    let errorObj = {};
    const statusCode = error.statusCode || 500;

    if (process.env.NODE_ENV === 'development') {
        errorObj = {
            message: customMessage || error.message,
            error: error
        };
    } else {
        // In production, mask 500+ errors or technical details
        const isDatabaseError = error.code === 11000 || error.code === 'P2002' || error.name === 'PrismaClientKnownRequestError';
        
        if (isSafeError && !isDatabaseError) {
            errorObj = {
                message: customMessage || error.message
            };
        } else {
            errorObj = {
                message: customMessage || 'An unexpected server error occurred. Please try again later.'
            };
        }
    }

    return NextResponse.json({
        success: false,
        statusCode: statusCode,
        ...errorObj
    }, { status: statusCode });
}

export const generateOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    return otp
}

export const columnConfig = (column, isCreatedAt = false, isUpdatedAt = false, isDeletedAt = false) => {
    const newColumn = [...column]

    if (isCreatedAt) {
        newColumn.push({
            accessorKey: 'createdAt',
            header: 'Created At',
            Cell: ({ renderedCellValue }) => (new Date(renderedCellValue).toLocaleString())
        })
    }
    if (isUpdatedAt) {
        newColumn.push({
            accessorKey: 'updatedAt',
            header: 'Updated At',
            Cell: ({ renderedCellValue }) => (new Date(renderedCellValue).toLocaleString())
        })
    }
    if (isDeletedAt) {
        newColumn.push({
            accessorKey: 'deletedAt',
            header: 'Deleted At',
            Cell: ({ renderedCellValue }) => (new Date(renderedCellValue).toLocaleString())
        })
    }

    return newColumn
}