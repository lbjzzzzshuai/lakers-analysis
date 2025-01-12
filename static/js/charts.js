// static/js/charts.js

// static/js/charts.js
// 修改数据加载部分
// 修改数据加载部分
// 在charts.js中添加调试日志

// 在charts.js的文件开头，修改数据加载部分
// 在charts.js的文件开头，修改数据加载部分
// 监听滚动事件来显示注释
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, {
    threshold: 0.5,
    rootMargin: '0px 0px -100px 0px'
});
document.addEventListener('DOMContentLoaded', function() {
    const notes = document.querySelectorAll('.story-note');
    notes.forEach(note => observer.observe(note));
    console.log('开始加载数据...');

    Promise.all([
        fetch('/api/chart_data'),
        fetch('/api/team_stats'),
        fetch('/api/predictions'),
        fetch('/api/playoff_data'),
        fetch('/api/team_power_analysis')
    ])
        .then(responses => Promise.all(responses.map(r => r.json())))
        .then(([chartData, teamStats, predictionsData, playoffData, powerAnalysisData]) => {
            console.log('数据加载完成');
            console.log('power analysis data:', powerAnalysisData); // 添加调试日志

            // 第一章图表初始化
            if (chartData && chartData.power_ratings_1920) {
                initPowerRatingChart(chartData.power_ratings_1920);
                initEfficiencyChart(chartData.power_ratings_1920);
                if (chartData.lakers_power) {
                    initLakersRadarChart(chartData.lakers_power);
                }
            }

            if (teamStats && teamStats.stats) {
                initTeamStatsChart(teamStats.stats);
            }

            if (teamStats && teamStats.standings) {
                initLeagueStandingsChart(teamStats.standings);
            }

            // 第二章图表初始化
            if (predictionsData && predictionsData.predictions && predictionsData.actual) {
                console.log('找到预测和实际数据');
                const predictionChart = document.getElementById('regularPredictionChart');
                if (predictionChart) {
                    console.log('找到预测图表容器，开始初始化...');
                    initRegularPredictionChart(predictionsData.predictions, predictionsData.actual);
                }
            }

            // 初始化球队数据分析图表
            if (powerAnalysisData && powerAnalysisData.success && powerAnalysisData.data) {
                console.log('初始化球队数据分析图表...');
                const container = document.getElementById('teamPowerAnalysis');
                if (container) {
                    initTeamPowerAnalysis(powerAnalysisData.data);
                } else {
                    console.error('找不到teamPowerAnalysis容器');
                }
            } else {
                console.error('球队分析数据格式不正确:', powerAnalysisData);
            }
        })
        .catch(error => {
            console.error('数据加载错误:', error);
        });
});
// 添加窗口大小变化的全局监听
window.addEventListener('resize', function() {
    const charts = document.querySelectorAll('.chart-container');
    charts.forEach(container => {
        const chart = echarts.getInstanceByDom(container);
        if (chart) {
            chart.resize();
            }
    });
});

// 在charts.js文件顶部添加映射对象
const teamNameMapping = {
    'Los Angeles Lakers': '洛杉矶湖人',
    'Milwaukee Bucks': '密尔沃基雄鹿',
    'Phoenix Suns': '菲尼克斯太阳',
    'Utah Jazz': '犹他爵士',
    'Philadelphia 76ers': '费城76人',
    'Brooklyn Nets': '布鲁克林篮网',
    'Denver Nuggets': '丹佛掘金',
    'Los Angeles Clippers': '洛杉矶快船',
    'Dallas Mavericks': '达拉斯独行侠',
    'Portland Trail Blazers': '波特兰开拓者',
    'Miami Heat': '迈阿密热火',
    'Atlanta Hawks': '亚特兰大老鹰',
    'Boston Celtics': '波士顿凯尔特人',
    'New York Knicks': '纽约尼克斯',
    'Golden State Warriors': '金州勇士',
    'Memphis Grizzlies': '孟菲斯灰熊',
    'San Antonio Spurs': '圣安东尼奥马刺',
    'Charlotte Hornets': '夏洛特黄蜂',
    'Indiana Pacers': '印第安纳步行者',
    'New Orleans Pelicans': '新奥尔良鹈鹕',
    'Chicago Bulls': '芝加哥公牛',
    'Sacramento Kings': '萨克拉门托国王',
    'Washington Wizards': '华盛顿奇才',
    'Toronto Raptors': '多伦多猛龙',
    'Cleveland Cavaliers': '克里夫兰骑士',
    'Orlando Magic': '奥兰多魔术',
    'Oklahoma City Thunder': '俄克拉荷马雷霆',
    'Minnesota Timberwolves': '明尼苏达森林狼',
    'Detroit Pistons': '底特律活塞',
    'Houston Rockets': '休斯顿火箭'
};
const playoffRoundMapping = {
    'First Round': '首轮',
    'Conference Semifinals': '分区半决赛',
    'Conference Finals': '分区决赛',
    'NBA Finals': '总决赛'
};

// ============= 第一章：紫金王座 =============

// 球队实力评级图
function initPowerRatingChart(data) {
    const chart = echarts.init(document.getElementById('powerRatingChart'));
    const sortedData = [...data].sort((a, b) => b.PowerRating - a.PowerRating);

    const option = {
        title: {
            text: '球队实力评级',
            textStyle: { color: '#FDB927' }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            formatter: function(params) {
                const data = params[0];
                return `${data.name}<br/>
                        战力值: ${data.value.toFixed(1)}<br/>
                        联盟排名: ${data.dataIndex + 1}`;
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'value',
            axisLabel: { color: '#fff' },
            splitLine: {
                lineStyle: { color: 'rgba(255,255,255,0.1)' }
            }
        },
        yAxis: {
            type: 'category',
            data: sortedData.map(item => item.Team),
            axisLabel: {
                color: '#fff',
                fontSize: 12
            }
        },
        series: [{
            name: '战力值',
            type: 'bar',
            data: sortedData.map(item => item.PowerRating),
            itemStyle: {
                color: function(params) {
                    if(params.name === 'Los Angeles Lakers') {
                        return new echarts.graphic.LinearGradient(0, 0, 1, 0, [{
                            offset: 0,
                            color: '#552583'
                        }, {
                            offset: 1,
                            color: '#FDB927'
                        }]);
                    }
                    return new echarts.graphic.LinearGradient(0, 0, 1, 0, [{
                        offset: 0,
                        color: '#1D428A'
                    }, {
                        offset: 1,
                        color: '#1D428A88'
                    }]);
                }
            },
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowColor: 'rgba(253,185,39,0.5)'
                }
            }
        }]
    };
    chart.setOption(option);
}

// 进攻-防守效率分布图
function initEfficiencyChart(data) {
    const chart = echarts.init(document.getElementById('efficiencyChart'));

    // 计算数据范围
    const ortgMin = Math.min(...data.map(item => item.ORtg));
    const ortgMax = Math.max(...data.map(item => item.ORtg));
    const drtgMin = Math.min(...data.map(item => item.DRtg));
    const drtgMax = Math.max(...data.map(item => item.DRtg));

    // 计算平均值
    const avgORtg = data.reduce((sum, item) => sum + item.ORtg, 0) / data.length;
    const avgDRtg = data.reduce((sum, item) => sum + item.DRtg, 0) / data.length;

    const option = {
        title: {
            text: '进攻-防守效率分布',
            textStyle: { color: '#FDB927' }
        },
        tooltip: {
            trigger: 'item',
            formatter: function(params) {
                const nrtg = (params.data[0] - params.data[1]).toFixed(1);
                const color = nrtg > 0 ? '#52c41a' : '#f5222d';
                return `${params.data[2]}<br/>
                        进攻效率: ${params.data[0].toFixed(1)}<br/>
                        防守效率: ${params.data[1].toFixed(1)}<br/>
                        <span style="color:${color}">净效率: ${nrtg}</span>`;
            }
        },
        grid: {
            left: '10%',
            right: '10%',
            top: '15%',
            bottom: '10%'
        },
        xAxis: {
            type: 'value',
            name: '进攻效率',
            nameTextStyle: {
                color: '#fff',
                padding: [0, 0, 0, 20]
            },
            min: Math.floor(ortgMin - 2),
            max: Math.ceil(ortgMax + 2),
            interval: 2,
            axisLabel: { color: '#fff' },
            splitLine: {
                lineStyle: {
                    color: 'rgba(255,255,255,0.1)',
                    type: 'dashed'
                }
            }
        },
        yAxis: {
            type: 'value',
            name: '防守效率（越低越好）',
            nameTextStyle: {
                color: '#fff',
                padding: [0, 0, 20, 0]
            },
            min: Math.floor(drtgMin - 2),
            max: Math.ceil(drtgMax + 2),
            interval: 2,
            axisLabel: { color: '#fff' },
            splitLine: {
                lineStyle: {
                    color: 'rgba(255,255,255,0.1)',
                    type: 'dashed'
                }
            }
        },
        series: [
            {
                type: 'scatter',
                data: data.map(item => [item.ORtg, item.DRtg, item.Team]),
                symbolSize: function(data) {
                    return data[2] === 'Los Angeles Lakers' ? 25 : 15;
                },
                itemStyle: {
                    color: function(params) {
                        if(params.data[2] === 'Los Angeles Lakers') {
                            return '#FDB927';
                        }
                        const nrtg = params.data[0] - params.data[1];
                        return nrtg > 0 ? '#1890ff' : '#f5222d';
                    },
                    opacity: 0.8,
                    borderColor: '#fff',
                    borderWidth: 1
                },
                emphasis: {
                    scale: true,
                    itemStyle: {
                        opacity: 1,
                        shadowBlur: 10,
                        shadowColor: 'rgba(253,185,39,0.5)'
                    }
                }
            }
        ]
    };
    chart.setOption(option);
}

// 湖人队数据雷达图
function initLakersRadarChart(lakersData) {
    const chart = echarts.init(document.getElementById('lakersRadarChart'));
    const option = {
        title: {
            text: '湖人队综合数据',
            textStyle: { color: '#FDB927' }
        },
        tooltip: {},
        radar: {
            indicator: [
                { name: '进攻效率', max: 120 },
                { name: '防守效率', max: 120 },
                { name: '净胜分', max: 15 },
                { name: '实力评级', max: 10 },
                { name: '进攻评分', max: 100 },
                { name: '防守评分', max: 100 }
            ],
            axisName: { color: '#fff' },
            splitArea: {
                areaStyle: {
                    color: ['rgba(255,255,255,0.05)',
                           'rgba(255,255,255,0.1)']
                }
            },
            splitLine: {
                lineStyle: {
                    color: 'rgba(255,255,255,0.2)'
                }
            }
        },
        series: [{
            type: 'radar',
            data: [{
                value: [
                    lakersData.ORtg,
                    lakersData.DRtg,
                    lakersData.MOV,
                    lakersData.SRS,
                    lakersData.OffensiveRating,
                    lakersData.DefensiveRating
                ],
                name: '湖人队数据',
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [{
                        offset: 0,
                        color: 'rgba(253, 185, 39, 0.8)'
                    }, {
                        offset: 1,
                        color: 'rgba(85, 37, 131, 0.3)'
                    }])
                },
                lineStyle: {
                    color: '#FDB927'
                },
                itemStyle: {
                    color: '#FDB927'
                }
            }]
        }]
    };
    chart.setOption(option);
}
// 球队核心数据对比图(修改后版本)
// 球队核心数据图表初始化函数
function initTeamStatsChart(stats) {
    const chart = echarts.init(document.getElementById('teamStatsChart'));
    console.log('正在初始化球队核心数据图表，数据:', stats);

    const metrics = [
        { name: '得分', key: 'PTS' },
        { name: '篮板', key: 'TRB' },
        { name: '助攻', key: 'AST' },
        { name: '抢断', key: 'STL' },
        { name: '盖帽', key: 'BLK' }
    ];

    const option = {
        title: { text: '球队核心数据对比', textStyle: { color: '#FDB927' } },
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' }
        },
        legend: {
            data: ['湖人队', '联盟平均', '联盟最高'],
            textStyle: { color: '#fff' },
            top: 25
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'value',
            axisLabel: { color: '#fff' },
            splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
        },
        yAxis: {
            type: 'category',
            data: metrics.map(m => m.name),
            axisLabel: { color: '#fff' }
        },
        series: [
            {
                name: '湖人队',
                type: 'bar',
                data: metrics.map(m => stats[m.key]?.lakers || 0),
                itemStyle: { color: '#FDB927' }
            },
            {
                name: '联盟平均',
                type: 'bar',
                data: metrics.map(m => stats[m.key]?.avg || 0),
                itemStyle: { color: '#552583' }
            },
            {
                name: '联盟最高',
                type: 'bar',
                data: metrics.map(m => stats[m.key]?.max || 0),
                itemStyle: { color: '#1D428A' }
            }
        ]
    };

    chart.setOption(option);
    console.log('球队核心数据图表初始化完成');
}
// 联盟战绩排名图表初始化函数
// 联盟战绩排名图表
function initLeagueStandingsChart(data) {
    const chart = echarts.init(document.getElementById('leagueStandingsChart'));
    let currentSortType = 'rank';

    // 排序函数
    function sortTeams(teams, sortType) {
        return [...teams].sort((a, b) => {
            switch(sortType) {
                case 'rank':
                    return b.WinPct - a.WinPct;
                case 'winPct':
                    return b.WinPct - a.WinPct;
                case 'wins':
                    return b.W - a.W;
                case 'losses':
                    return a.L - b.L;
                default:
                    return 0;
            }
        });
    }

    // 更新图表
    function updateChart(sortType) {
        const westTeams = sortTeams(data.filter(t => t.Conference === 'West'), sortType);
        const eastTeams = sortTeams(data.filter(t => t.Conference === 'East'), sortType);

        const option = {
            title: [{
                text: '西部排名',
                textStyle: { color: '#FDB927', fontSize: 16 },
                left: '25%',
                top: 10
            }, {
                text: '东部排名',
                textStyle: { color: '#FDB927', fontSize: 16 },
                left: '75%',
                top: 10
            }],
            tooltip: {
                trigger: 'axis',
                formatter: function(params) {
                    const data = params[0].data;
                    return `${params[0].name}<br/>
                            胜-负: ${data.wins}-${data.losses}<br/>
                            胜率: ${(data.winPct * 100).toFixed(1)}%`;
                }
            },
            grid: [{
                left: '5%',
                right: '55%',
                top: 50,
                bottom: 20,
                containLabel: true
            }, {
                left: '55%',
                right: '5%',
                top: 50,
                bottom: 20,
                containLabel: true
            }],
            xAxis: [{
                type: 'value',
                gridIndex: 0,
                show: false
            }, {
                type: 'value',
                gridIndex: 1,
                show: false
            }],
            yAxis: [{
                type: 'category',
                gridIndex: 0,
                data: westTeams.map(t => t.Team),
                axisLabel: {
                    color: '#fff',
                    formatter: function(value) {
                        return value === 'Los Angeles Lakers' ?
                               `{a|${value}}` : value;
                    },
                    rich: {
                        a: {
                            color: '#FDB927',
                            fontWeight: 'bold'
                        }
                    }
                }
            }, {
                type: 'category',
                gridIndex: 1,
                data: eastTeams.map(t => t.Team),
                axisLabel: { color: '#fff' }
            }],
            series: [{
                name: '西部',
                type: 'bar',
                xAxisIndex: 0,
                yAxisIndex: 0,
                data: westTeams.map((t, i) => ({
                    value: sortType === 'losses' ? t.L : (sortType === 'wins' ? t.W : t.WinPct * 100),
                    wins: t.W,
                    losses: t.L,
                    winPct: t.WinPct,
                    itemStyle: {
                        color: t.Team === 'Los Angeles Lakers' ? '#FDB927' : '#1D428A'
                    },
                    label: {
                        show: true,
                        position: 'right',
                        formatter: `${t.W}-${t.L}`,
                        color: '#fff'
                    }
                }))
            }, {
                name: '东部',
                type: 'bar',
                xAxisIndex: 1,
                yAxisIndex: 1,
                data: eastTeams.map((t, i) => ({
                    value: sortType === 'losses' ? t.L : (sortType === 'wins' ? t.W : t.WinPct * 100),
                    wins: t.W,
                    losses: t.L,
                    winPct: t.WinPct,
                    itemStyle: { color: '#1D428A' },
                    label: {
                        show: true,
                        position: 'right',
                        formatter: `${t.W}-${t.L}`,
                        color: '#fff'
                    }
                }))
            }]
        };

        chart.setOption(option);
    }

    // 初始化图表
    updateChart(currentSortType);

    // 添加排序按钮事件监听
    document.querySelectorAll('.controls-container .btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // 更新按钮状态
            document.querySelectorAll('.controls-container .btn').forEach(b =>
                b.classList.remove('active'));
            this.classList.add('active');

            // 更新图表
            currentSortType = this.dataset.sort;
            updateChart(currentSortType);
        });
    });
}

// 新的季后赛对阵图函数 (可用于两个赛季)
// 修改季后赛对阵图初始化函数
// 修改季后赛对阵图函数
// 季后赛对阵图
// 定义球队名称到缩写的映射
const teamToAbbrev = {
    // 东部联盟
    'Boston Celtics': 'BOS',
    'Brooklyn Nets': 'BKN',
    'New York Knicks': 'NYK',
    'Philadelphia 76ers': 'PHI',
    'Toronto Raptors': 'TOR',
    'Chicago Bulls': 'CHI',
    'Cleveland Cavaliers': 'CLE',
    'Detroit Pistons': 'DET',
    'Indiana Pacers': 'IND',
    'Milwaukee Bucks': 'MIL',
    'Atlanta Hawks': 'ATL',
    'Charlotte Hornets': 'CHA',
    'Miami Heat': 'MIA',
    'Orlando Magic': 'ORL',
    'Washington Wizards': 'WAS',
    // 西部联盟
    'Denver Nuggets': 'DEN',
    'Minnesota Timberwolves': 'MIN',
    'Oklahoma City Thunder': 'OKC',
    'Portland Trail Blazers': 'POR',
    'Utah Jazz': 'UTA',
    'Golden State Warriors': 'GSW',
    'Los Angeles Clippers': 'LAC',
    'Los Angeles Lakers': 'LAL',
    'Phoenix Suns': 'PHX',
    'Sacramento Kings': 'SAC',
    'Dallas Mavericks': 'DAL',
    'Houston Rockets': 'HOU',
    'Memphis Grizzlies': 'MEM',
    'New Orleans Pelicans': 'NOP',
    'San Antonio Spurs': 'SAS'
};

function initPlayoffChart(data, containerId) {
    const chart = echarts.init(document.getElementById(containerId));

    const option = {
        title: {
            text: '20-21赛季季后赛预测',
            textStyle: { color: '#FDB927', fontSize: 20, fontWeight: 'bold' },
            left: 'center',
            top: 10
        },
        backgroundColor: 'transparent',
        graphic: [
            // 东部标题
            {
                type: 'text',
                left: '25%',
                top: 50,
                style: {
                    text: '东部赛区',
                    textAlign: 'center',
                    fill: '#FDB927',
                    fontSize: 16,
                    fontWeight: 'bold'
                }
            },
            // 西部标题
            {
                type: 'text',
                left: '75%',
                top: 50,
                style: {
                    text: '西部赛区',
                    textAlign: 'center',
                    fill: '#FDB927',
                    fontSize: 16,
                    fontWeight: 'bold'
                }
            }
        ],
        series: [
            {
                type: 'graph',
                layout: 'none',
                symbolSize: 50,
                roam: false,
                label: {
                    show: true,
                    position: 'inside',
                    formatter: function(params) {
                        return [
                            `{logo|${params.data.logo}}`,
                            `{team|${params.data.team}}`,
                            `{score|${params.data.score}}`
                        ].join('\n');
                    },
                    rich: {
                        logo: {
                            height: 25,
                            align: 'center'
                        },
                        team: {
                            color: '#fff',
                            fontSize: 12,
                            align: 'center',
                            padding: [5, 0]
                        },
                        score: {
                            color: '#FDB927',
                            fontSize: 14,
                            fontWeight: 'bold',
                            align: 'center'
                        }
                    }
                },
                edgeSymbol: ['circle', 'arrow'],
                edgeSymbolSize: [4, 10],
                itemStyle: {
                    color: '#1D428A',
                    borderColor: '#fff',
                    borderWidth: 2
                },
                lineStyle: {
                    color: '#FDB927',
                    width: 2
                },
                data: [
                    // 东部第一轮
                    {x: 100, y: 100, name: '1. 76ers', symbol: 'image://path/to/76ers-logo.png'},
                    {x: 100, y: 200, name: '8. Wizards', symbol: 'image://path/to/wizards-logo.png'},
                    // ... 其他球队节点
                ],
                links: [
                    // 连接线
                    {source: '1. 76ers', target: '8. Wizards'},
                    // ... 其他连接
                ]
            }
        ]
    };

    chart.setOption(option);
}
function initRegularPredictionChart(predictions, actual) {
    const chart = echarts.init(document.getElementById('regularPredictionChart'));
    let currentView = 'both'; // 控制显示数据
    let currentSort = 'rank'; // 控制排序方式

    // 排序函数
    function sortTeams(teams, sortType) {
        return [...teams].sort((a, b) => {
            switch(sortType) {
                case 'rank':
                    return b.WinPct - a.WinPct;
                case 'winPct':
                    return b.WinPct - a.WinPct;
                case 'wins':
                    return b.W - a.W;
                case 'losses':
                    return a.L - b.L;
                default:
                    return 0;
            }
        });
    }

    function updateChart() {
        // 按当前排序方式对数据进行排序
        const westTeams2021 = sortTeams(predictions.filter(t => t.Conference === 'West'), currentSort);
        const eastTeams2021 = sortTeams(predictions.filter(t => t.Conference === 'East'), currentSort);

        // 根据排序后的顺序重新排列实际数据
        const westTeams1920 = westTeams2021.map(team2021 => {
            return actual.find(team1920 => team1920.Team === team2021.Team) || {
                Team: team2021.Team,
                W: 0,
                L: 0,
                WinPct: 0
            };
        });

        const eastTeams1920 = eastTeams2021.map(team2021 => {
            return actual.find(team1920 => team1920.Team === team2021.Team) || {
                Team: team2021.Team,
                W: 0,
                L: 0,
                WinPct: 0
            };
        });

        const option = {
            title: [{
                text: '西部排名',
                subtext: '20-21赛季实际vs模拟',
                textStyle: { color: '#FDB927', fontSize: 16 },
                left: '25%',
                top: 10
            }, {
                text: '东部排名',
                subtext: '20-21赛季实际vs模拟',
                textStyle: { color: '#FDB927', fontSize: 16 },
                left: '75%',
                top: 10
            }],
            legend: {
                data: ['20-21实际', '20-21模拟'],
                textStyle: { color: '#fff' },
                top: 40,
                left: 'center',
                selected: {
                    '20-21实际': currentView === 'both' || currentView === 'actual',
                    '20-21模拟': currentView === 'both' || currentView === 'prediction'
                }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                formatter: function(params) {
                    const team = params[0].name;
                    let text = `${team}<br/>`;
                    params.forEach(param => {
                        const data = param.data;
                        text += `${param.seriesName}: ${data.wins}-${data.losses} (${(data.winPct * 100).toFixed(1)}%)<br/>`;
                    });
                    return text;
                }
            },
            grid: [{
                left: '5%',
                right: '52%',
                top: 80,
                bottom: 20,
                containLabel: true
            }, {
                left: '52%',
                right: '5%',
                top: 80,
                bottom: 20,
                containLabel: true
            }],
            xAxis: [{
                type: 'value',
                gridIndex: 0,
                show: false
            }, {
                type: 'value',
                gridIndex: 1,
                show: false
            }],
            yAxis: [{
                type: 'category',
                gridIndex: 0,
                data: westTeams2021.map(t => t.Team),
                axisLabel: {
                    color: '#fff',
                    fontSize: 14,
                    interval: 0,
                    margin: 15,
                    formatter: function(value) {
                        return value === 'Los Angeles Lakers' ?
                               `{a|${value}}` : value;
                    },
                    rich: {
                        a: {
                            color: '#FDB927',
                            fontWeight: 'bold'
                        }
                    }
                }
            }, {
                type: 'category',
                gridIndex: 1,
                data: eastTeams2021.map(t => t.Team),
                axisLabel: {
                    color: '#fff',
                    fontSize: 14,
                    interval: 0,
                    margin: 15
                }
            }],
            series: [
                // 西部20-21模拟
                {
                    name: '20-21模拟',
                    type: 'bar',
                    xAxisIndex: 0,
                    yAxisIndex: 0,
                    z: 2,
                    barWidth: '40%',
                    barGap: '10%',
                    data: westTeams2021.map(t => ({
                        value: currentSort === 'losses' ? t.L : (currentSort === 'wins' ? t.W : t.WinPct * 100),
                        wins: t.W,
                        losses: t.L,
                        winPct: t.WinPct,
                        itemStyle: {
                            color: t.Team === 'Los Angeles Lakers' ? '#FDB927' : '#1D428A'
                        },
                        label: {
                            show: true,
                            position: 'insideRight',
                            formatter: `${t.W}-${t.L}`,
                            color: '#fff'
                        }
                    }))
                },
                // 西部20-21实际
                {
                    name: '20-21实际',
                    type: 'bar',
                    xAxisIndex: 0,
                    yAxisIndex: 0,
                    barWidth: '40%',
                    barGap: '10%',
                    data: westTeams1920.map(t => ({
                        value: currentSort === 'losses' ? t.L : (currentSort === 'wins' ? t.W : t.WinPct * 100),
                        wins: t.W,
                        losses: t.L,
                        winPct: t.WinPct,
                        itemStyle: {
                            color: 'rgba(144, 238, 144, 0.6)'
                        },
                        label: {
                            show: true,
                            position: 'right',
                            offset: [5, 0],
                            formatter: `${t.W}-${t.L}`,
                            color: '#90EE90'
                        }
                    }))
                },
                // 东部20-21模拟
                {
                    name: '20-21模拟',
                    type: 'bar',
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    z: 2,
                    barWidth: '40%',
                    barGap: '10%',
                    data: eastTeams2021.map(t => ({
                        value: currentSort === 'losses' ? t.L : (currentSort === 'wins' ? t.W : t.WinPct * 100),
                        wins: t.W,
                        losses: t.L,
                        winPct: t.WinPct,
                        itemStyle: { color: '#1D428A' },
                        label: {
                            show: true,
                            position: 'insideRight',
                            formatter: `${t.W}-${t.L}`,
                            color: '#fff'
                        }
                    }))
                },
                // 东部20-21实际
                {
                    name: '20-21实际',
                    type: 'bar',
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    barWidth: '40%',
                    barGap: '10%',
                    data: eastTeams1920.map(t => ({
                        value: currentSort === 'losses' ? t.L : (currentSort === 'wins' ? t.W : t.WinPct * 100),
                        wins: t.W,
                        losses: t.L,
                        winPct: t.WinPct,
                        itemStyle: {
                            color: 'rgba(144, 238, 144, 0.6)'
                        },
                        label: {
                            show: true,
                            position: 'right',
                            offset: [5, 0],
                            formatter: `${t.W}-${t.L}`,
                            color: '#90EE90'
                        }
                    }))
                }
            ]
        };

        chart.setOption(option);
    }

    // 初始化图表
    updateChart();

    // 添加图例按钮事件监听
    document.querySelectorAll('.legend-container .btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.legend-container .btn').forEach(b =>
                b.classList.remove('active'));
            this.classList.add('active');
            currentView = this.dataset.view;
            updateChart();
        });
    });

    // 添加排序按钮事件监听
    document.querySelectorAll('.sort-controls .btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.sort-controls .btn').forEach(b =>
                b.classList.remove('active'));
            this.classList.add('active');
            currentSort = this.dataset.sort;
            updateChart();
        });
    });

    // 添加窗口大小变化的监听
    window.addEventListener('resize', () => {
        chart.resize();
    });
}
// 修改2021战力图表初始化函数
// 在charts.js中添加这个新函数
function init2021PowerRatingChart(data) {
    const chart = echarts.init(document.getElementById('rankingChangeChart'));

    // 使用原生 JavaScript 排序替代 lodash
    const sortedTeams = [...data].sort((a, b) => b.PowerRating - a.PowerRating);

    const option = {
        title: {
            text: '20-21赛季球队战力分布',
            subtext: '湖人队数据使用19-20赛季冠军阵容战力',
            textStyle: {
                color: '#FDB927',
                fontSize: 16,
                fontWeight: 'bold'
            },
            subtextStyle: {
                color: '#fff',
                fontSize: 12
            },
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            formatter: function(params) {
                const data = params[0];
                const team = data.name;
                const isLakers = team === 'Los Angeles Lakers';
                return `${team}${isLakers ? ' (19-20赛季数据)' : ''}<br/>
                        战力值: ${data.value.toFixed(1)}<br/>
                        进攻评分: ${data.data.ORtg.toFixed(1)}<br/>
                        防守评分: ${data.data.DRtg.toFixed(1)}<br/>
                        净胜分: ${data.data.MOV.toFixed(1)}`;
            }
        },
        grid: {
            top: 80,
            bottom: 30,
            left: '15%',
            right: '5%'
        },
        xAxis: {
            type: 'value',
            axisLabel: {
                color: '#fff',
                formatter: '{value}'
            },
            splitLine: {
                lineStyle: { color: 'rgba(255,255,255,0.1)' }
            }
        },
        yAxis: {
            type: 'category',
            data: sortedTeams.map(t => getChineseTeamName(t.Team)),
            axisLabel: {
                color: '#fff',
                fontSize: 12,
                formatter: function(value) {
                    return value === getChineseTeamName('Los Angeles Lakers') ?
                           `{a|${value}}` : value;
                },
                rich: {
                    a: {
                        color: '#FDB927',
                        fontWeight: 'bold'
                    }
                }
            }
        },
        series: [{
            type: 'bar',
            data: sortedTeams.map(t => ({
                value: t.PowerRating,
                ORtg: t.ORtg,
                DRtg: t.DRtg,
                MOV: t.MOV,
                itemStyle: {
                    color: t.Team === 'Los Angeles Lakers' ?
                        new echarts.graphic.LinearGradient(0, 0, 1, 0, [{
                            offset: 0,
                            color: '#552583'
                        }, {
                            offset: 1,
                            color: '#FDB927'
                        }]) :
                        new echarts.graphic.LinearGradient(0, 0, 1, 0, [{
                            offset: 0,
                            color: '#1D428A'
                        }, {
                            offset: 1,
                            color: '#1D428A88'
                        }])

                }

            })),
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                formatter: function(params) {
                    const data = params[0];
                    const team = getChineseTeamName(data.name);
                    const isLakers = data.name === 'Los Angeles Lakers';
                    return `${team}${isLakers ? ' (19-20赛季数据)' : ''}<br/>
                            战力值: ${data.value.toFixed(1)}<br/>
                            进攻评分: ${data.data.ORtg.toFixed(1)}<br/>
                            防守评分: ${data.data.DRtg.toFixed(1)}<br/>
                            净胜分: ${data.data.MOV.toFixed(1)}`;
                }
            },
            barWidth: '60%',
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowColor: 'rgba(253,185,39,0.5)'

                }
            }

        }]
    };

    chart.setOption(option);

    // 添加窗口大小变化的监听
    window.addEventListener('resize', () => {
        chart.resize();
    });
}

// 优化关键数据对比


function initKeyStatsCompareChart(data) {
    const chart = echarts.init(document.getElementById('keyStatsCompareChart'));

    const option = {
        title: {
            text: '湖人队核心数据对比',
            textStyle: { color: '#FDB927', fontSize: 18, fontWeight: 'bold' }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' }
        },
        legend: {
            data: ['19-20赛季', '20-21赛季模拟'],
            textStyle: { color: '#fff' },
            top: 30
        },
        radar: {
            center: ['50%', '60%'],
            radius: '65%',
            indicator: [
                { name: '胜率', max: 100, color: '#fff' },
                { name: '场均得分', max: 120, color: '#fff' },
                { name: '场均篮板', max: 60, color: '#fff' },
                { name: '场均助攻', max: 30, color: '#fff' },
                { name: '净胜分', max: 10, color: '#fff' }
            ],
            name: {
                textStyle: {
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 'bold'
                }
            },
            splitArea: {
                areaStyle: {
                    color: ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']
                }
            },
            axisLine: {
                lineStyle: { color: 'rgba(255,255,255,0.3)' }
            },
            splitLine: {
                lineStyle: { color: 'rgba(255,255,255,0.3)' }
            }
        },
        series: [
            {
                name: '数据对比',
                type: 'radar',
                data: [
                    {
                        name: '19-20赛季',
                        value: [71.2, 113.3, 44.8, 25.4, 7.1],
                        symbolSize: 8,
                        lineStyle: {
                            color: '#552583',
                            width: 3
                        },
                        areaStyle: {
                            color: 'rgba(85,37,131,0.7)'
                        },
                        label: {
                            show: true,
                            color: '#fff',
                            formatter: '{c}'
                        }
                    },
                    {
                        name: '20-21赛季模拟',
                        value: [68.5, 112.5, 43.9, 24.8, 6.8],
                        symbolSize: 8,
                        lineStyle: {
                            color: '#FDB927',
                            width: 3
                        },
                        areaStyle: {
                            color: 'rgba(253,185,39,0.7)'
                        },
                        label: {
                            show: true,
                            color: '#fff',
                            formatter: '{c}'
                        }
                    }
                ]
            }
        ]
    };

    chart.setOption(option);
}
// 添加一个转换函数
function getChineseTeamName(englishName) {
    return teamNameMapping[englishName] || englishName;
}
function normalizeValue(value, min, max) {
    return ((value - min) / (max - min)) * 100;
}

function calculateTeamStats(teamData) {
    return {
        offense: normalizeValue(teamData.ORtg, 100, 120),
        defense: normalizeValue(120 - teamData.DRtg, 0, 20),
        movement: normalizeValue(teamData.PACE, 95, 105),
        efficiency: normalizeValue(teamData.TS_pct, 0.5, 0.6),
        teamwork: normalizeValue(teamData.ASTPercentage, 50, 70)
    };
}

// 生成季后赛对阵连接线
function generatePlayoffLinks(layout) {
    const links = [];

    // 添加西部连接线
    for (let i = 0; i < layout.west.length - 1; i++) {
        const curr = layout.west[i];
        const next = layout.west[i + 1];
        if (curr.winner === next.team1 || curr.winner === next.team2) {
            links.push({
                source: curr.x + ',' + curr.y,
                target: next.x + ',' + next.y
            });
        }
    }

    // 添加东部连接线
    for (let i = 0; i < layout.east.length - 1; i++) {
        const curr = layout.east[i];
        const next = layout.east[i + 1];
        if (curr.winner === next.team1 || curr.winner === next.team2) {
            links.push({
                source: curr.x + ',' + curr.y,
                target: next.x + ',' + next.y
            });
        }
    }

    // 添加总决赛连接线
    if (layout.finals) {
        const westFinal = layout.west[layout.west.length - 1];
        const eastFinal = layout.east[layout.east.length - 1];

        if (westFinal && layout.finals.team1 === westFinal.winner) {
            links.push({
                source: westFinal.x + ',' + westFinal.y,
                target: layout.finals.x + ',' + layout.finals.y
            });
        }

        if (eastFinal && layout.finals.team1 === eastFinal.winner) {
            links.push({
                source: eastFinal.x + ',' + eastFinal.y,
                target: layout.finals.x + ',' + layout.finals.y
            });
        }
    }

    return links;
}
function initTeamPowerAnalysis(teamsData) {
    const chart = echarts.init(document.getElementById('teamPowerAnalysis'));

    // 计算数据范围和归一化函数
    function normalizeValue(value, min, max) {
        return ((value - min) / (max - min) * 100).toFixed(1);
    }

    // 计算球队整体数据范围
    const statsRange = {
        powerRating: {
            min: Math.min(...teamsData.map(t => t.PowerRating)),
            max: Math.max(...teamsData.map(t => t.PowerRating))
        },
        ortg: {
            min: Math.min(...teamsData.map(t => t.ORtg)),
            max: Math.max(...teamsData.map(t => t.ORtg))
        },
        drtg: {
            min: Math.min(...teamsData.map(t => t.DRtg)),
            max: Math.max(...teamsData.map(t => t.DRtg))
        },
        mov: {
            min: Math.min(...teamsData.map(t => t.MOV)),
            max: Math.max(...teamsData.map(t => t.MOV))
        }
    };

    // 按战力值排序
    const sortedTeams = [...teamsData].sort((a, b) => b.PowerRating - a.PowerRating);

    // 基础配置
    const option = {
        backgroundColor: 'transparent',
        title: {
            text: '球队战力值排名',
            left: 'center',
            top: 20,
            textStyle: {
                color: '#FDB927',
                fontSize: 20,
                fontWeight: 'bold'
            }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            top: 80,
            bottom: 30,
            left: '15%',
            right: '5%'
        },
        xAxis: {
            type: 'value',
            axisLabel: {
                color: '#fff',
                formatter: '{value}'
            },
            splitLine: {
                lineStyle: {
                    color: 'rgba(255,255,255,0.1)'
                }
            }
        },
        yAxis: {
            type: 'category',
            data: sortedTeams.map(t => getChineseTeamName(t.Team)),
            axisLabel: {
                color: '#fff',
                fontSize: 12
            }
        },
        series: [{
            type: 'bar',
            data: sortedTeams.map(t => ({
                value: t.PowerRating,
                ORtg: t.ORtg,
                DRtg: t.DRtg,
                MOV: t.MOV,
                itemStyle: {
                    color: t.Team === 'Los Angeles Lakers' ?
                        new echarts.graphic.LinearGradient(0, 0, 1, 0, [{
                            offset: 0,
                            color: '#552583'
                        }, {
                            offset: 1,
                            color: '#FDB927'
                        }]) : '#1D428A'
                }
            })),
            barWidth: '60%'
        }]
    };

    // 处理雷达图数据
    function processTeamRadarData(teamData) {
        return [
            // 战力值 - 归一化到0-100
            parseFloat(normalizeValue(teamData.PowerRating, statsRange.powerRating.min, statsRange.powerRating.max)),
            // 进攻效率 - 归一化到0-100
            parseFloat(normalizeValue(teamData.ORtg, statsRange.ortg.min, statsRange.ortg.max)),
            // 防守效率 - 反转并归一化到0-100（越低越好）
            parseFloat(normalizeValue(statsRange.drtg.max - teamData.DRtg, 0, statsRange.drtg.max - statsRange.drtg.min)),
            // 净胜分 - 归一化到0-100
            parseFloat(normalizeValue(teamData.MOV, statsRange.mov.min, statsRange.mov.max)),
            // 整体进攻 - 使用OffensiveRating
            parseFloat(normalizeValue(teamData.OffensiveRating,
                Math.min(...teamsData.map(t => t.OffensiveRating)),
                Math.max(...teamsData.map(t => t.OffensiveRating)))),
            // 整体防守 - 使用DefensiveRating
            parseFloat(normalizeValue(teamData.DefensiveRating,
                Math.min(...teamsData.map(t => t.DefensiveRating)),
                Math.max(...teamsData.map(t => t.DefensiveRating))))
        ];
    }

    // 点击事件处理
    chart.on('click', params => {
        const teamData = sortedTeams.find(t => getChineseTeamName(t.Team) === params.name);
        if (teamData) {

            const radarOption = {
                title: {
                    text: getChineseTeamName(teamData.Team) + '详细数据分析',
                    subtext: '点击空白处返回战力值排名',
                    textStyle: {
                        color: '#FDB927',
                        fontSize: 20
                    },
                    subtextStyle: { color: '#fff' }
                },
                tooltip: {
                    formatter: function(params) {
                        return `${params.name}<br/>
                                战力值: ${params.value[0]}分<br/>
                                进攻效率: ${params.value[1]}分<br/>
                                防守效率: ${params.value[2]}分<br/>
                                净胜分: ${params.value[3]}分<br/>
                                整体进攻: ${params.value[4]}分<br/>
                                整体防守: ${params.value[5]}分`;
                    }
                },
                radar: {
                    indicator: [
                        { name: '战力值', max: 100 },
                        { name: '进攻效率', max: 100 },
                        { name: '防守效率', max: 100 },
                        { name: '净胜分', max: 100 },
                        { name: '整体进攻', max: 100 },
                        { name: '整体防守', max: 100 }
                    ],
                    center: ['50%', '50%'],
                    radius: '60%',
                    shape: 'circle',
                    name: {
                        textStyle: {
                            color: '#fff',
                            fontSize: 14
                        }
                    },
                    splitArea: {
                        areaStyle: {
                            color: ['rgba(255,255,255,0.1)']
                        }
                    },
                    axisLine: {
                        lineStyle: { color: 'rgba(255,255,255,0.3)' }
                    },
                    splitLine: {
                        lineStyle: { color: 'rgba(255,255,255,0.3)' }
                    }
                },
                series: [{
                    type: 'radar',
                    data: [{
                        value: processTeamRadarData(teamData),
                        name: getChineseTeamName(teamData.Team),
                        areaStyle: {
                            color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
                                {
                                    offset: 0,
                                    color: teamData.Team === 'Los Angeles Lakers' ? '#552583' : '#1D428A'
                                },
                                {
                                    offset: 1,
                                    color: teamData.Team === 'Los Angeles Lakers' ? '#FDB927' : '#1D428A88'
                                }
                            ])
                        },
                        lineStyle: {
                            width: 2,
                            color: teamData.Team === 'Los Angeles Lakers' ? '#FDB927' : '#1D428A'
                        }
                    }]
                }]
            };

            chart.setOption(radarOption, true);
        }
    });

    // 点击空白处返回战力值排名
    chart.getZr().on('click', params => {
        if (!params.target) {
            chart.setOption(option, true);
        }
    });

    // 初始化图表
    chart.setOption(option);

    // 添加窗口大小变化的监听
    window.addEventListener('resize', () => {
        chart.resize();
    });
}
// 响应式调整
window.addEventListener('resize', function() {
    const charts = document.querySelectorAll('.chart-container');
    charts.forEach(container => {
        const chart = echarts.getInstanceByDom(container);
        if (chart) chart.resize();
    });
});