'use client';

import React, { useState } from 'react';
import { Download, Calendar, FileText, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { formatDate } from '@/lib/dates';
import { Transaction } from '@/types/transaction';
import { Account } from '@/types/account';
import { Category } from '@/types/category';

interface ExportDataProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  onExport: (data: Record<string, unknown>[], filename: string) => void;
}

export function ExportData({ transactions, accounts, categories, onExport }: ExportDataProps) {
  const [dateRange, setDateRange] = useState<'all' | 'current_month' | 'last_month' | 'last_3_months' | 'last_6_months' | 'last_year'>('current_month');
  const [transactionType, setTransactionType] = useState<'all' | 'ingreso' | 'gasto'>('all');
  const [selectedFields, setSelectedFields] = useState<string[]>([
    'date', 'type', 'amount', 'description', 'category', 'account'
  ]);

  const availableFields = [
    { value: 'date', label: 'Fecha' },
    { value: 'type', label: 'Tipo' },
    { value: 'amount', label: 'Monto' },
    { value: 'description', label: 'Descripción' },
    { value: 'category', label: 'Categoría' },
    { value: 'account', label: 'Cuenta' },
    { value: 'note', label: 'Nota' }
  ];

  const getDateRangeTransactions = () => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (dateRange) {
      case 'current_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'last_month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'last_3_months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case 'last_6_months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        break;
      case 'last_year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        break;
      default:
        return transactions;
    }

    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  };

  const getFilteredTransactions = () => {
    let filtered = getDateRangeTransactions();

    if (transactionType !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === transactionType);
    }

    return filtered;
  };

  const formatTransactionForExport = (transaction: Transaction): Record<string, unknown> => {
    const account = accounts.find(acc => acc.id === transaction.accountId);
    const category = categories.find(cat => cat.id === transaction.categoryId);

    const formattedTransaction: Record<string, unknown> = {};

    if (selectedFields.includes('date')) {
      formattedTransaction['Fecha'] = formatDate(new Date(transaction.date));
    }
    if (selectedFields.includes('type')) {
      formattedTransaction['Tipo'] = transaction.type === 'ingreso' ? 'Ingreso' : 'Gasto';
    }
    if (selectedFields.includes('amount')) {
      formattedTransaction['Monto'] = transaction.amount;
    }
    if (selectedFields.includes('description')) {
      formattedTransaction['Descripción'] = transaction.note || '';
    }
    if (selectedFields.includes('category')) {
      formattedTransaction['Categoría'] = category?.name || '';
    }
    if (selectedFields.includes('account')) {
      formattedTransaction['Cuenta'] = account?.name || '';
    }
    if (selectedFields.includes('note')) {
      formattedTransaction['Nota'] = transaction.note || '';
    }

    return formattedTransaction;
  };

  const exportToCSV = () => {
    const filteredTransactions = getFilteredTransactions();
    const formattedData = filteredTransactions.map(formatTransactionForExport);

    if (formattedData.length === 0) {
      alert('No hay transacciones para exportar con los filtros seleccionados.');
      return;
    }

    // Crear CSV
    const headers = Object.keys(formattedData[0]);
    const csvContent = [
      headers.join(','),
      ...formattedData.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escapar comillas y envolver en comillas si contiene comas
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    // Crear archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    const filename = `transacciones_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onExport(formattedData, filename);
  };

  const getDateRangeLabel = () => {
    switch (dateRange) {
      case 'all': return 'Todas las fechas';
      case 'current_month': return 'Mes actual';
      case 'last_month': return 'Mes anterior';
      case 'last_3_months': return 'Últimos 3 meses';
      case 'last_6_months': return 'Últimos 6 meses';
      case 'last_year': return 'Último año';
      default: return '';
    }
  };

  const getTransactionTypeLabel = () => {
    switch (transactionType) {
      case 'all': return 'Todos los tipos';
      case 'ingreso': return 'Solo ingresos';
      case 'gasto': return 'Solo gastos';
      default: return '';
    }
  };

  const filteredCount = getFilteredTransactions().length;

  return (
    <div className="max-h-[70vh] overflow-y-auto space-y-4 scrollbar-auto-hide">
      {/* Resumen general */}
      <div className="bg-muted/50 border border-border/50 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          <Download className="h-4 w-4 text-muted-foreground" />
          <h4 className="font-medium text-sm">Exportar Transacciones</h4>
        </div>
        <p className="text-xs text-muted-foreground">
          Exporta tus transacciones en formato CSV. Filtra por fecha, tipo y selecciona campos.
        </p>
      </div>

      {/* Filtros */}
      <div className="space-y-3">
        <h3 className="text-md font-semibold flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          Filtros
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Rango de fechas */}
          <div>
            <label className="block text-sm font-medium mb-1">
              <Calendar className="h-4 w-4 inline mr-1" />
              Rango de Fechas
            </label>
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
            >
              <option value="all">Todas las fechas</option>
              <option value="current_month">Mes actual</option>
              <option value="last_month">Mes anterior</option>
              <option value="last_3_months">Últimos 3 meses</option>
              <option value="last_6_months">Últimos 6 meses</option>
              <option value="last_year">Último año</option>
            </Select>
          </div>

          {/* Tipo de transacción */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Tipo de Transacción
            </label>
            <Select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value as typeof transactionType)}
            >
              <option value="all">Todos los tipos</option>
              <option value="ingreso">Solo ingresos</option>
              <option value="gasto">Solo gastos</option>
            </Select>
          </div>
        </div>

        {/* Campos a exportar */}
        <div>
          <label className="block text-sm font-medium mb-1">
            <FileText className="h-4 w-4 inline mr-1" />
            Campos a Exportar
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
            {availableFields.map(field => (
              <label key={field.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedFields.includes(field.value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedFields([...selectedFields, field.value]);
                    } else {
                      setSelectedFields(selectedFields.filter(f => f !== field.value));
                    }
                  }}
                  className="rounded border-border"
                />
                <span className="text-sm">{field.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Resumen de exportación */}
      <div className="bg-muted/50 border border-border/50 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <h4 className="font-medium text-sm">Resumen</h4>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">Transacciones a exportar:</span>
            <span className="ml-2 font-medium">{filteredCount}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Campos seleccionados:</span>
            <span className="ml-2 font-medium">{selectedFields.length}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Período:</span>
            <span className="ml-2 font-medium">{getDateRangeLabel()}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Tipo:</span>
            <span className="ml-2 font-medium">{getTransactionTypeLabel()}</span>
          </div>
        </div>
      </div>

      {/* Botón de exportación */}
      <div className="flex justify-center pt-2">
        <Button
          onClick={exportToCSV}
          disabled={filteredCount === 0 || selectedFields.length === 0}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Exportar a CSV ({filteredCount} transacciones)
        </Button>
      </div>
    </div>
  );
}
