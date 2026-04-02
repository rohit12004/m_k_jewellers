
import { NextResponse } from "next/server"

export const response = (success, statusCode, message, data = {}) => {
    return NextResponse.json({
        success, statusCode, message, data
    }, { status: statusCode })  // Set actual HTTP status code
}

export const catchError = (error, customMessage) => {
    //handling duplicate key error (Mongoose)
    if (error.code === 11000 && error.keyPattern) {
        const keys = Object.keys(error.keyPattern).join(",")
        error.message = `Duplicate fields: ${keys}. These fields value must be unique.`
    }

    // Prisma Unique Constraint (P2002)
    if (error.code === 'P2002') {
        const fields = error.meta?.target?.join(', ') || 'field';
        error.message = `A unique constraint failed on the following fields: ${fields}.`;
    }

    let errorObj = {}

    if (process.env.NODE_ENV === 'development') {
        errorObj = {
            message: error.message,
            error
        }
    } else {
        errorObj = {
            message: error.message || 'internal server error'
        }
    }

    return NextResponse.json({
        success: false,
        statusCode: error.statusCode,
        ...errorObj
    })
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