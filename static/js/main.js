document.addEventListener('DOMContentLoaded', function() {
    // 滚动动画
    const fadeElements = document.querySelectorAll('.fade-in');
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeElements.forEach(element => {
        observer.observe(element);
    });

    // 导航栏滚动效果
    let lastScrollTop = 0;
    const navbar = document.getElementById('mainNav');

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > 100) {
            navbar.classList.add('navbar-shrink');
            if (scrollTop > lastScrollTop) {
                navbar.style.top = '-80px';
            } else {
                navbar.style.top = '0';
            }
        } else {
            navbar.classList.remove('navbar-shrink');
        }

        lastScrollTop = scrollTop;
    });
});

// 平滑滚动到第一章
function scrollToChapterOne() {
    const chapterOne = document.getElementById('chapter-one');
    chapterOne.scrollIntoView({ behavior: 'smooth' });
}

// 图表交互功能
let activeTeam = null;

function showTeamDetails(teamName) {
    if (activeTeam === teamName) {
        return;
    }
    activeTeam = teamName;

    fetch(`/api/team_data/${teamName}`)
        .then(response => response.json())
        .then(data => {
            // 更新球队详细数据显示
            updateTeamDetailsDisplay(data);
        })
        .catch(error => console.error('Error:', error));
}

function updateTeamDetailsDisplay(data) {
    // 实现球队详细数据的展示逻辑
}

// 窗口大小改变时重新调整图表大小
let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
        const charts = document.querySelectorAll('.chart-container');
        charts.forEach(container => {
            const chart = echarts.getInstanceByDom(container);
            if (chart) {
                chart.resize();
            }
        });
    }, 250);
});

// 添加球队对比功能
function compareTeams(teamA, teamB) {
    fetch(`/api/team_comparison?teams=${teamA},${teamB}`)
        .then(response => response.json())
        .then(data => {
            // 更新对比图表
            updateComparisonCharts(data);
        })
        .catch(error => console.error('Error:', error));
}

function updateComparisonCharts(data) {
    // 实现球队对比图表的更新逻辑
}
// 联盟数据筛选控制
function initLeagueDataControls() {
    const statSelect = document.getElementById('statSelect');
    statSelect.addEventListener('change', function(e) {
        const selectedStat = e.target.value;
        // 更新图表显示
        updateLeagueComparisonChart(selectedStat);
    });
}

// 排序控制
function initSortControls() {
    const sortSelect = document.getElementById('sortSelect');
    sortSelect.addEventListener('change', function(e) {
        const sortBy = e.target.value;
        // 更新数据排序
        updateDataSort(sortBy);
    });
}