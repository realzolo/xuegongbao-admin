import React, {useEffect, useState} from 'react';
import {Badge, Button, Card, Message, PaginationProps, Popconfirm, Space, Table} from '@arco-design/web-react';
import {IconDelete} from '@arco-design/web-react/icon';
import {substrAndEllipsis} from "@/utils/string";
import {deleteReservationById, getReservationList} from "@/api/reservation";
import ReservationDetail from './ReservationDetail';
import {StatusCode, StatusMessage} from "@/constant/status";

const Reservation: React.FC = () => {
    const [data, setData] = useState<API.Reservation[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [visible, setVisible] = useState<boolean>(false);
    const [currentItem, setCurrentItem] = useState<API.Reservation>(null);
    const [pagination, setPagination] = useState<PaginationProps>({
        sizeCanChange: false,
        showTotal: true,
        total: 0,
        pageSize: 10,
        current: 1
    });

    useEffect(() => {
        fetchData();
    }, [pagination.current]);

    const fetchData = async () => {
        setLoading(true);
        const {code, data}: API.Response = await getReservationList(
            (pagination.current - 1) * pagination.pageSize,
            pagination.pageSize
        );
        if (code != StatusCode.OK) {
            Message.error(StatusMessage.FETCH_DATA_ERROR);
            setLoading(false);
            return;
        }
        const {items, total} = data;
        setData(items);
        setPagination({
            ...pagination,
            total
        });
        setLoading(false);
    }

    const onView = (record: API.Reservation) => {
        setCurrentItem(record);
        setVisible(true);
    }

    const onDelete = async (record: API.Reservation) => {
        const {code}: API.Response = await deleteReservationById(record.id);
        if (code != StatusCode.OK) {
            Message.error(StatusMessage.DELETE_FAILED);
            return;
        }
        setData(data.filter(item => item.id !== record.id));
        Message.success(StatusMessage.DELETE_OK);
    }

    const doCallback = (newItem: API.Reservation) => {
        setData(data.map(item => item.id === newItem.id ? newItem : item));
    }

    const doHidden = () => {
        setVisible(false);
    }

    const onChangeTable = (pagination) => {
        setPagination(pagination);
    }

    const columns = [
        {
            title: "ID",
            dataIndex: 'id'
        },
        {
            title: "????????????",
            dataIndex: 'type',
        },
        {
            title: "????????????",
            dataIndex: 'stuName'
        },
        {
            title: "??????",
            dataIndex: 'sdept'
        },
        {
            title: "??????",
            dataIndex: 'content',
            render: (text) => substrAndEllipsis(text, 20)
        },
        {
            title: "??????",
            dataIndex: 'status',
            render: (value: boolean) => (
                <>
                    {
                        value ? <Badge status="success" text="?????????"/> : <Badge status="error" text="?????????"/>
                    }
                </>
            ),
        },
        {
            title: "??????",
            dataIndex: 'operations',
            width: 200,
            render: (_, record: API.Reservation) => (
                <>
                    <Space>
                        <Button type="primary" size="small" onClick={() => onView(record)}>??????</Button>
                        <Popconfirm
                            title='????????????????'
                            onOk={() => onDelete(record)}
                        >
                            <Button type="primary" icon={<IconDelete/>} status="danger" size="small">??????</Button>
                        </Popconfirm>
                    </Space>
                </>
            ),
        },
    ];

    return (
        <>
            <Card>
                <Table
                    rowKey="id"
                    loading={loading}
                    columns={columns}
                    data={data}
                    stripe={true}
                    border={true}
                    pagination={pagination}
                    onChange={onChangeTable}
                />
            </Card>
            <ReservationDetail visible={visible} data={currentItem} callback={doCallback} hidden={doHidden}/>
        </>
    );
}


export default Reservation;
