import React, {useEffect, useState} from 'react';
import {Button, Card, Message, PaginationProps, Popconfirm, Table} from '@arco-design/web-react';
import {IconDelete, IconPlus} from '@arco-design/web-react/icon';
import PhoneEditor from "@/pages/phonebook/PhoneEditor";
import {deletePhoneNumberById, getPhoneBookList} from "@/api/phonebook";
import {StatusCode, StatusMessage} from "@/constant/status";

const PhoneBook: React.FC = () => {
    const [data, setData] = useState<API.PhoneBook[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [visible, setVisible] = useState<boolean>(false);
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
        const {code, data}: API.Response = await getPhoneBookList(
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

    const doCallback = async () => {
        await fetchData();
    }

    const doHidden = () => {
        setVisible(false);
    }

    const onAdd = () => {
        setVisible(true);
    }

    const onDelete = async (record: API.PhoneBook) => {
        const {code}: API.Response = await deletePhoneNumberById(record.id);
        if (code != StatusCode.OK) {
            Message.error(StatusMessage.DELETE_FAILED);
            return;
        }
        setData(data.filter(item => item.id !== record.id));
        Message.success(StatusMessage.DELETE_OK);
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
            title: "??????",
            dataIndex: 'deptName'
        },
        {
            title: "????????????",
            dataIndex: 'phone'
        },
        {
            title: "??????",
            dataIndex: 'operations',
            width: 200,
            render: (_, record: API.PhoneBook) => (
                <Popconfirm
                    title='????????????????'
                    onOk={() => onDelete(record)}
                >
                    <Button type="primary" icon={<IconDelete/>} status="danger" size="small">??????</Button>
                </Popconfirm>
            ),
        },
    ];

    return (
        <>
            <Card>
                <div style={{marginBottom: "8px"}}>
                    <Button type="primary" icon={<IconPlus/>} onClick={onAdd}>??????</Button>
                </div>
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
                <PhoneEditor visible={visible} callback={doCallback} hidden={doHidden}/>
            </Card>
        </>
    );
}

export default PhoneBook;
