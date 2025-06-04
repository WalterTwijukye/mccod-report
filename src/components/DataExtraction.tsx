// components/DataExtraction.tsx
import React, { useState, useEffect } from "react";
import {
    Button,
    Select,
    DatePicker,
    Table,
    Pagination,
    Spin,
    message,
} from "antd";
import { SearchOutlined, DownloadOutlined } from "@ant-design/icons";
import axios from "axios";

const { Option } = Select;
const { RangePicker } = DatePicker;

interface Program {
    id: string;
    name: string;
}

interface OrgUnit {
    id: string;
    name: string;
}

interface TableColumn {
    title: string;
    dataIndex: string;
    key: string;
    width?: number;
    render?: (text: string, record: any) => React.ReactNode;
}

export const DataExtraction: React.FC = () => {
    const [program, setProgram] = useState<string | undefined>(undefined);
    const [orgUnit, setOrgUnit] = useState<string | undefined>(undefined);
    const [dateRange, setDateRange] = useState<[string, string] | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(100);
    const [loading, setLoading] = useState(false);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [orgUnits, setOrgUnits] = useState<OrgUnit[]>([]);
    const [tableData, setTableData] = useState<any[]>([]);
    const [columns, setColumns] = useState<TableColumn[]>([]);
    const [totalRecords, setTotalRecords] = useState(0);

    // Fetch programs and org units on component mount
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);

                // Fetch programs
                const programsResponse = await axios.get(
                    `${process.env.REACT_APP_DHIS2_URL}/api/programs.json?fields=id,name`
                );
                setPrograms(programsResponse.data.programs);

                // Fetch org units
                const orgUnitsResponse = await axios.get(
                    `${process.env.REACT_APP_DHIS2_URL}/api/organisationUnits.json?fields=id,name&paging=false`
                );
                setOrgUnits(orgUnitsResponse.data.organisationUnits);
            } catch (error) {
                message.error('Failed to load initial data');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    const fetchData = async (page: number, size: number) => {
        if (!program) return;

        try {
            setLoading(true);

            // Build query parameters
            const params: Record<string, any> = {
                programStage: 'aKclf7Yl1PE',
                page,
                pageSize: size,
                totalPages: true,
                order: 'created',
                includeAllDataElements: true,
                attributeCc: 'UjXPudXlraY',
                attributeCos: 'l4UMmqvSBe5',
                program,
            };

            if (orgUnit) {
                params.orgUnit = orgUnit;
            }

            if (dateRange) {
                params.startDate = dateRange[0];
                params.endDate = dateRange[1];
            }

            const response = await axios.get(
                `${process.env.REACT_APP_DHIS2_URL}/api/events/query.json`,
                { params }
            );

            // Process the response data
            if (response.data.rows && response.data.rows.length > 0) {
                // Generate columns from headers with compact rendering
                const generatedColumns: TableColumn[] = response.data.headers
                    .filter((header: any) => !header.hidden && !header.meta)
                    .map((header: any) => ({
                        title: header.column,
                        dataIndex: header.name,
                        key: header.name,
                        width: 120, // Further reduced width to prevent blank space
                        render: (text: string) => (
                            <div style={{ 
                                padding: '2px 4px',
                                lineHeight: '1.2',
                                fontSize: '12px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {text || '-'}
                            </div>
                        ),
                    }));

                // Generate table data
                const generatedData = response.data.rows.map((row: any[], index: number) => {
                    const rowData: Record<string, any> = { key: index.toString() };
                    response.data.headers.forEach((header: any, i: number) => {
                        rowData[header.name] = row[i];
                    });
                    return rowData;
                });

                setColumns(generatedColumns);
                setTableData(generatedData);
                setTotalRecords(response.data.metaData.pager.total);
            } else {
                setTableData([]);
                setColumns([]);
                setTotalRecords(0);
            }
        } catch (error) {
            message.error('Failed to fetch data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        setCurrentPage(1); // Reset to first page when performing new search
        await fetchData(1, pageSize);
    };

    // const handleDownload = async () => {
    //     if (!program) {
    //         message.warning('Please select a program');
    //         return;
    //     }
    
    //     try {
    //         setLoading(true);
    
    //         // Build query parameters - same as search but without pagination
    //         const params: Record<string, any> = {
    //             programStage: 'aKclf7Yl1PE',
    //             program,
    //             includeAllDataElements: true,
    //             attributeCc: 'UjXPudXlraY',
    //             attributeCos: 'l4UMmqvSBe5',
    //             skipPaging: true, // Get all records
    //             order: 'created', // Same ordering as search
    //         };
    
    //         // Apply same filters as search
    //         if (orgUnit) {
    //             params.orgUnit = orgUnit;
    //         }
    
    //         if (dateRange) {
    //             params.startDate = dateRange[0];
    //             params.endDate = dateRange[1];
    //         }
    
    //         // First, get the JSON data
    //         const response = await axios.get(
    //             `${process.env.REACT_APP_DHIS2_URL}/api/events/query.json`,
    //             { params }
    //         );
    
    //         if (response.data.rows && response.data.rows.length > 0) {
    //             // Convert JSON to CSV format
    //             const headers = response.data.headers
    //                 .filter((header: any) => !header.hidden && !header.meta)
    //                 .map((header: any) => header.column);
                
    //             const csvRows = [
    //                 headers.join(','), // Header row
    //                 ...response.data.rows.map((row: any[]) => {
    //                     // Filter out hidden and meta columns, same as table display
    //                     const filteredRow = response.data.headers
    //                         .map((header: any, index: number) => {
    //                             if (header.hidden || header.meta) return null;
    //                             const value = row[index] || '';
    //                             // Escape commas and quotes in CSV
    //                             return `"${value.toString().replace(/"/g, '""')}"`;
    //                         })
    //                         .filter(item => item !== null);
    //                     return filteredRow.join(',');
    //                 })
    //             ];
    
    //             const csvContent = csvRows.join('\n');
                
    //             // Create and download the file
    //             const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    //             const url = window.URL.createObjectURL(blob);
    //             const link = document.createElement('a');
    //             link.href = url;
                
    //             // Create filename with timestamp
    //             const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    //             const programName = programs.find(p => p.id === program)?.name || program;
    //             link.setAttribute('download', `${programName}_${timestamp}.csv`);
                
    //             document.body.appendChild(link);
    //             link.click();
    //             link.remove();
    //             window.URL.revokeObjectURL(url);
                
    //             message.success(`Downloaded ${response.data.rows.length} records`);
    //         } else {
    //             message.warning('No data available to download');
    //         }
    //     } catch (error) {
    //         message.error('Failed to download data');
    //         console.error(error);
    //     } finally {
    //         setLoading(false);
    //     }
    // };


    const handleDownload = async () => {
        if (!program) {
            message.warning('Please select a program');
            return;
        }
    
        try {
            setLoading(true);
    
            // Build query parameters for CSV endpoint
            const params: Record<string, any> = {
                programStage: 'aKclf7Yl1PE',
                program,
                includeAllDataElements: true,
                attributeCc: 'UjXPudXlraY',
                attributeCos: 'l4UMmqvSBe5',
                paging: false, // Get all records
                order: 'created', // Same ordering as search
            };
    
            // Apply same filters as search
            if (orgUnit) {
                params.orgUnit = orgUnit;
            }
    
            if (dateRange) {
                params.startDate = dateRange[0];
                params.endDate = dateRange[1];
            }
    
            // Use the CSV endpoint directly
            const response = await axios.get(
                `${process.env.REACT_APP_DHIS2_URL}/api/events/query.csv`,
                { 
                    params,
                    responseType: 'blob' // Important: handle as blob for file download
                }
            );
    
            // Create and download the file
            const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            
            // Create filename with timestamp
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            const programName = programs.find(p => p.id === program)?.name || program;
            link.setAttribute('download', `${programName}_${timestamp}.csv`);
            
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            message.success('Data downloaded successfully');
        } catch (error) {
            message.error('Failed to download data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page: number, size: number) => {
        setCurrentPage(page);
        setPageSize(size);
        fetchData(page, size);
    };

    // Create CSS styles dynamically
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            .compact-table .ant-table-tbody > tr > td {
                padding: 4px 8px !important;
                height: 28px !important;
                vertical-align: middle !important;
                border-bottom: 1px solid #f0f0f0 !important;
                line-height: 1.2 !important;
            }
            
            .compact-table .ant-table-thead > tr > th {
                padding: 4px 8px !important;
                height: 28px !important;
                font-size: 12px !important;
                font-weight: 700 !important;
                background-color: #f5f5f5 !important;
                border-bottom: 2px solid #d9d9d9 !important;
                text-align: center !important;
                vertical-align: middle !important;
                line-height: 1.2 !important;
            }
            
            .compact-table .ant-table-thead > tr > th::before {
                display: none !important;
            }
            
            .compact-table .ant-table-row {
                height: 28px !important;
            }
            
            .compact-table .ant-table {
                font-size: 12px !important;
            }
            
            .compact-table .ant-table-thead {
                background-color: #f5f5f5 !important;
            }
            
            .compact-table .ant-table-container {
                border-spacing: 0 !important;
            }
            
            .compact-table .ant-table-content {
                overflow-x: auto !important;
            }
            
            /* Alternating row colors */
            .compact-table .ant-table-tbody > tr:nth-child(even) {
                background-color: #f8f9fa !important;
            }
            
            .compact-table .ant-table-tbody > tr:nth-child(odd) {
                background-color: #ffffff !important;
            }
            
            /* Hover effect */
            .compact-table .ant-table-tbody > tr:hover > td {
                background-color: #e6f7ff !important;
            }
            
            /* Remove extra spacing */
            .compact-table .ant-table-scroll {
                overflow-x: auto !important;
            }
            
            .compact-table {
                width: 100% !important;
            }
        `;
        document.head.appendChild(style);
        
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    return (
        <div style={{ padding: '16px' }}>
            
            <Spin spinning={loading}>
                {/* Filter Section */}
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '16px',
                    marginBottom: '16px',
                    alignItems: 'flex-end'
                }}>
                    <div>
                        <div style={{ marginBottom: '4px', fontSize: '14px' }}>Program</div>
                        <Select
                            placeholder="Select program..."
                            style={{ width: '300px' }}
                            onChange={setProgram}
                            value={program}
                            loading={loading}
                        >
                            {programs.map((p) => (
                                <Option key={p.id} value={p.id}>
                                    {p.name}
                                </Option>
                            ))}
                        </Select>
                    </div>

                    <div>
                        <div style={{ marginBottom: '4px', fontSize: '14px' }}>Organisation Unit</div>
                        <Select
                            placeholder="Select organisation unit..."
                            style={{ width: '300px' }}
                            onChange={setOrgUnit}
                            value={orgUnit}
                            loading={loading}
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                (option?.children as string).toLowerCase().includes(input.toLowerCase())
                            }
                        >
                            {orgUnits.map((unit) => (
                                <Option key={unit.id} value={unit.id}>
                                    {unit.name}
                                </Option>
                            ))}
                        </Select>
                    </div>

                    <div>
                        <div style={{ marginBottom: '4px', fontSize: '14px' }}>Date Range</div>
                        <RangePicker
                            onChange={(dates, dateStrings) => setDateRange(dateStrings)}
                            style={{ width: '300px' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <Button
                            type="primary"
                            icon={<SearchOutlined />}
                            onClick={handleSearch}
                            disabled={!program}
                        >
                            Search
                        </Button>
                        <Button
                            icon={<DownloadOutlined />}
                            onClick={handleDownload}
                            disabled={!program || tableData.length === 0}
                        >
                            Download
                        </Button>
                    </div>
                </div>

                {/* Table Section */}
                {tableData.length > 0 ? (
                    <>
                        <div style={{ width: '100%' }}>
                            <Table
                                className="compact-table"
                                columns={columns}
                                dataSource={tableData}
                                pagination={false}
                                scroll={{ x: 'max-content' }}
                                bordered
                                size="small"
                                showHeader={true}
                                rowClassName={(record, index) => `compact-row ${index % 2 === 0 ? 'even-row' : 'odd-row'}`}
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: '16px'
                        }}>
                            <Pagination
                                current={currentPage}
                                total={totalRecords}
                                onChange={handlePageChange}
                                onShowSizeChange={handlePageChange}
                                showSizeChanger
                                pageSizeOptions={["10", "20", "50", "100"]}
                                pageSize={pageSize}
                            />
                            <div style={{ fontSize: '14px' }}>
                                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} records
                            </div>
                        </div>
                    </>
                ) : (
                    <div style={{
                        textAlign: 'center',
                        padding: '40px',
                        backgroundColor: '#fafafa',
                        border: '1px dashed #d9d9d9',
                        borderRadius: '4px'
                    }}>
                        No data available. Please perform a search.
                    </div>
                )}
            </Spin>
        </div>
    );
};