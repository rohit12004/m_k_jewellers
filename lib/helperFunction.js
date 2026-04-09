
import { NextResponse } from "next/server"

export const response = (success, statusCode, message, data = {}) => {
    return NextResponse.json({
        success, statusCode, message, data
    }, { status: statusCode })  // Set actual HTTP status code
}

/**
 * Handles Prisma specific errors and returns user-friendly messages
 */
export const handlePrismaError = (error) => {
    switch (error.code) {
        case 'P1001':
            return {
                statusCode: 503,
                message: 'Database connection failed. The server is unable to reach the database (Network Error).'
            };
        case 'P1002':
            return {
                statusCode: 504,
                message: 'Database connection timed out. Please try again later.'
            };
        case 'P1008':
            return {
                statusCode: 504,
                message: 'Database operation timed out.'
            };
        case 'P1017':
            return {
                statusCode: 503,
                message: 'Database connection was closed. Please try again.'
            };
        case 'P2002':
            return {
                statusCode: 400,
                message: `Duplicate entry: A record with this ${error.meta?.target || 'value'} already exists.`
            };
        case 'P2025':
            return {
                statusCode: 404,
                message: 'The requested record was not found.'
            };
        default:
            // Check for connection strings in error message if code is missing
            if (error.message?.includes("Can't reach database server")) {
                return {
                    statusCode: 503,
                    message: 'Database connection failed (Network Error).'
                };
            }
            return null;
    }
}

export const catchError = (error, customMessage) => {
    const prismaError = handlePrismaError(error);
    
    let statusCode = error.statusCode || 500;
    let message = customMessage || error.message || 'Internal server error';

    if (prismaError) {
        statusCode = prismaError.statusCode;
        message = prismaError.message;
    } else if (error.code === 11000) {
        // Handle MongoDB-style duplicate key if applicable
        const keys = Object.keys(error.keyPattern || {}).join(",");
        message = `Duplicate fields: ${keys}. These fields value must be unique.`;
        statusCode = 400;
    }

    let errorObj = {}

    if (process.env.NODE_ENV === 'development') {
        errorObj = {
            message: message,
            error: {
                message: error.message,
                code: error.code,
                meta: error.meta
            }
        }
    } else {
        errorObj = {
            message: message
        }
    }

    return NextResponse.json({
        success: false,
        statusCode,
        ...errorObj
    }, { status: statusCode })
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