import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { calculateUserMetrics } from '../utils/calculateMetricsNew'
import { saveUserMetrics, getUserMetrics } from '../firebase/metrics'
import { getAllUsers } from '../firebase/users'
import './ResultsDashboard.css'

const COLORS = {
  strongly_agree: '#10b981',
  agree: '#34d399',
  disagree: '#f87171',
  strongly_disagree: '#ef4444'
}

const ResultsDashboard = ({ user }) => {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)
  const [users, setUsers] = useState([])

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true)
      
      // Get cached metrics first
      const cachedMetrics = await getUserMetrics(user.id)
      
      if (cachedMetrics) {
        setMetrics(cachedMetrics)
        setLoading(false)
      } else {
        // Calculate if not cached
        await calculateAndSaveMetrics()
      }

      // Load users for section 2 display
      const allUsers = await getAllUsers()
      setUsers(allUsers)
    }
    
    loadDashboard()
  }, [user])

  const calculateAndSaveMetrics = async () => {
    setCalculating(true)
    const calculatedMetrics = await calculateUserMetrics(user.id)
    
    if (calculatedMetrics) {
      await saveUserMetrics(user.id, calculatedMetrics)
      setMetrics(calculatedMetrics)
    }
    
    setCalculating(false)
    setLoading(false)
  }

  const prepareSection1Data = (questionMetrics) => {
    return [
      { name: 'أوافق بشدة', value: questionMetrics.counts.strongly_agree, color: COLORS.strongly_agree },
      { name: 'أوافق', value: questionMetrics.counts.agree, color: COLORS.agree },
      { name: 'لا أوافق', value: questionMetrics.counts.disagree, color: COLORS.disagree },
      { name: 'لا أوافق بشدة', value: questionMetrics.counts.strongly_disagree, color: COLORS.strongly_disagree }
    ].filter(item => item.value > 0)
  }

  const prepareSection2Data = () => {
    if (!metrics?.section2) return []
    
    return Object.entries(metrics.section2).map(([questionId, data]) => ({
      question: data.question,
      count: data.count
    }))
  }


  if (loading || calculating) {
    return (
      <div className="dashboard-container">
        <div className="loading-message">
          {calculating ? 'جاري حساب النتائج...' : 'جاري التحميل...'}
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="dashboard-container">
        <div className="error-message">لا توجد بيانات متاحة</div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">لوحة النتائج - {user.name}</h1>

      {/* Section 1: Pie Charts */}
      <div className="dashboard-section">
        <h2 className="section-header">القسم الأول - التقييمات</h2>
        <div className="charts-grid">
          {Object.entries(metrics.section1 || {}).map(([questionId, questionMetrics]) => (
            <div key={questionId} className="chart-card">
              <h3 className="chart-title">{questionMetrics.question}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={prepareSection1Data(questionMetrics)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {prepareSection1Data(questionMetrics).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [`${value} صوت`, name]}
                    contentStyle={{ 
                      backgroundColor: 'var(--bg-secondary)', 
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <Legend 
                    formatter={(value) => value}
                    wrapperStyle={{ color: 'var(--text-primary)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <p className="chart-total">إجمالي الإجابات: {questionMetrics.total}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Bar Chart */}
      <div className="dashboard-section">
        <h2 className="section-header">القسم الثاني - من القلب للقلب</h2>
        <div className="chart-card">
          <ResponsiveContainer width="100%" height={500}>
            <BarChart 
              data={prepareSection2Data()}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis 
                type="category" 
                dataKey="question" 
                width={200}
                tick={{ fill: 'var(--text-primary)', fontSize: 14 }}
              />
              <Tooltip 
                formatter={(value) => [`${value} شخص`, 'عدد الأشخاص']}
                contentStyle={{ 
                  backgroundColor: 'var(--bg-secondary)', 
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)'
                }}
              />
              <Legend 
                formatter={(value) => value}
                wrapperStyle={{ color: 'var(--text-primary)', paddingTop: '20px' }}
              />
              <Bar dataKey="count" fill="#6366f1" name="عدد الأشخاص" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Section 3: Comments */}
      <div className="dashboard-section">
        <h2 className="section-header">القسم الثالث - التعليقات</h2>
        <div className="comments-list">
          {metrics.section3 && metrics.section3.length > 0 ? (
            metrics.section3.map((comment, index) => (
              <div key={index} className="comment-card">
                <div className="comment-header">
                  <span className="comment-date">
                    {comment.timestamp instanceof Date 
                      ? comment.timestamp.toLocaleDateString('ar-SA')
                      : comment.timestamp?.toDate 
                        ? comment.timestamp.toDate().toLocaleDateString('ar-SA')
                        : comment.timestamp 
                          ? new Date(comment.timestamp.seconds * 1000).toLocaleDateString('ar-SA')
                          : 'تاريخ غير معروف'}
                  </span>
                </div>
                <p className="comment-text">{comment.comment}</p>
              </div>
            ))
          ) : (
            <p className="no-comments">لا توجد تعليقات</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResultsDashboard

